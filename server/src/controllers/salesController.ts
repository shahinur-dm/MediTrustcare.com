import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { SalesOrder } from '../models/SalesOrder';
import { SalesInvoice } from '../models/SalesInvoice';
import { DeliveryChallan } from '../models/DeliveryChallan';
import { Customer } from '../models/Customer';
import { Inventory } from '../models/Inventory';
import { InventoryService } from '../services/inventoryService';
import { AccountingService } from '../services/accountingService';
import { logAudit } from '../services/auditService';

export const getSalesOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, customer } = req.query;
    const query: any = {};
    if (status) query.status = status;
    if (customer) query.customer = customer;

    const orders = await SalesOrder.find(query)
      .populate('customer', 'name code phone deliveryAddress district')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name code unit dosageForm strength mrp')
      .populate('items.batch', 'batchNumber expDate')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch sales orders', error: error.message });
  }
};

export const createSalesOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { customer: customerId, branch, warehouse, items, deliveryDate, shippingAddress, notes } = req.body;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    if (customer.status !== 'active') {
      res.status(400).json({ success: false, message: `Cannot create order for customer with status '${customer.status}'` });
      return;
    }

    // 1. Calculate pricing & FEFO allocation check
    let subtotal = 0;
    let totalDiscount = 0;
    let totalVat = 0;

    const processedItems = [];

    for (const item of items) {
      const lineGross = item.quantity * item.unitPrice;
      const discount = (lineGross * (item.discountPercent || customer.discountRate || 0)) / 100;
      const lineTaxable = lineGross - discount;
      const vat = (lineTaxable * (item.vatPercent || 15)) / 100;
      const lineTotal = lineTaxable + vat;

      subtotal += lineGross;
      totalDiscount += discount;
      totalVat += vat;

      // Check stock availability in warehouse
      const inv = await Inventory.findOne({ product: item.product, warehouse });
      if (!inv || inv.availableQuantity < item.quantity) {
        res.status(400).json({
          success: false,
          message: `Insufficient stock in selected warehouse for product. Available: ${inv ? inv.availableQuantity : 0}, requested: ${item.quantity}`,
        });
        return;
      }

      processedItems.push({
        product: item.product,
        batch: item.batch,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountPercent: item.discountPercent || customer.discountRate || 0,
        discountAmount: discount,
        vatPercent: item.vatPercent || 15,
        vatAmount: vat,
        totalAmount: lineTotal,
      });
    }

    const grandTotal = subtotal - totalDiscount + totalVat;

    // 2. Credit limit check
    if (customer.currentBalance + grandTotal > customer.creditLimit) {
      res.status(400).json({
        success: false,
        message: `Credit Limit Exceeded! Customer current balance is ${customer.currentBalance} BDT, credit limit is ${customer.creditLimit} BDT. Order total is ${grandTotal} BDT.`,
      });
      return;
    }

    const orderNumber = `SO-${Date.now()}`;
    const order = await SalesOrder.create({
      orderNumber,
      customer: customer._id,
      branch,
      warehouse,
      orderDate: new Date(),
      deliveryDate,
      items: processedItems,
      subtotal,
      totalDiscount,
      totalVat,
      grandTotal,
      status: 'pending_approval',
      shippingAddress: shippingAddress || customer.deliveryAddress,
      notes,
      createdBy: req.user?._id,
    });

    await logAudit({
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE_SALES_ORDER',
      module: 'Sales',
      entityId: orderNumber,
      details: `Created Sales Order ${orderNumber} for ${customer.name} (${grandTotal} BDT)`,
    });

    res.status(201).json({ success: true, data: order, message: 'Sales Order booked successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create sales order', error: error.message });
  }
};

/**
 * Approve Sales Order, reserve stock, generate Delivery Challan & Sales Invoice
 */
export const approveSalesOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = await SalesOrder.findById(req.params.id).populate('customer');
    if (!order) {
      res.status(404).json({ success: false, message: 'Sales Order not found' });
      return;
    }

    if (order.status !== 'pending_approval') {
      res.status(400).json({ success: false, message: `Order cannot be approved from status '${order.status}'` });
      return;
    }

    // 1. FEFO Allocation & Stock Deduction
    for (const item of order.items) {
      // Allocate FEFO if batch not already explicitly assigned
      let batchId = item.batch?.toString();
      if (!batchId) {
        const allocations = await InventoryService.allocateStockFEFO({
          productId: item.product.toString(),
          warehouseId: order.warehouse.toString(),
          requestedQty: item.quantity,
        });
        batchId = allocations[0].batchId;
        item.batch = batchId as any;
      }

      await InventoryService.recordMovement({
        type: 'SALES_DISPATCH',
        productId: item.product.toString(),
        batchId,
        warehouseId: order.warehouse.toString(),
        quantity: -item.quantity,
        unitCost: item.unitPrice,
        referenceDocType: 'SalesOrder',
        referenceDocId: order.orderNumber,
        notes: `Dispatched for Sales Order ${order.orderNumber}`,
        performedBy: req.user?._id,
      });
    }

    order.status = 'approved';
    order.approvedBy = req.user?._id;
    await order.save();

    // 2. Generate Delivery Challan
    const challanNumber = `CHAL-${Date.now()}`;
    const challan = await DeliveryChallan.create({
      challanNumber,
      salesOrder: order._id,
      customer: order.customer,
      warehouse: order.warehouse,
      routeArea: (order.customer as any).upazila || 'Central Zone',
      district: (order.customer as any).district || 'Faridpur',
      status: 'assigned',
      createdBy: req.user?._id,
    });

    // 3. Generate NBR Compliant Sales Invoice (Mushak-6.3)
    const invoiceNumber = `SINV-${Date.now()}`;
    const mushakNumber = `MUSHAK-6.3-${Date.now().toString().slice(-6)}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + ((order.customer as any).creditDays || 15));

    const invoice = await SalesInvoice.create({
      invoiceNumber,
      mushakNumber,
      salesOrder: order._id,
      customer: order.customer,
      branch: order.branch,
      warehouse: order.warehouse,
      items: order.items.map((i) => ({
        product: i.product,
        batch: i.batch,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountAmount: i.discountAmount,
        vatPercent: i.vatPercent,
        vatAmount: i.vatAmount,
        totalAmount: i.totalAmount,
      })),
      subtotal: order.subtotal,
      totalDiscount: order.totalDiscount,
      totalVat: order.totalVat,
      grandTotal: order.grandTotal,
      paidAmount: 0,
      balanceAmount: order.grandTotal,
      paymentStatus: 'unpaid',
      deliveryStatus: 'pending',
      dueDate,
      createdBy: req.user?._id,
    });

    challan.salesInvoice = invoice._id;
    await challan.save();

    // 4. Update Customer Balance (AR)
    await Customer.findByIdAndUpdate(order.customer, {
      $inc: { currentBalance: order.grandTotal },
    });

    // 5. Double Entry Accounting: Debit Accounts Receivable (Asset), Credit Sales Revenue & VAT Payable
    try {
      await AccountingService.recordJournalEntry({
        narration: `Sales to ${(order.customer as any).name} via Invoice ${invoiceNumber} (Mushak-6.3)`,
        referenceType: 'SalesInvoice',
        referenceId: invoiceNumber,
        createdBy: req.user?._id,
        lines: [
          { accountCode: '1030', debit: order.grandTotal, credit: 0, description: 'Accounts Receivable - Customer' },
          { accountCode: '4010', debit: 0, credit: order.subtotal - order.totalDiscount, description: 'Sales Revenue' },
          { accountCode: '2020', debit: 0, credit: order.totalVat, description: 'NBR VAT Output Payable' },
        ],
      });
    } catch (accErr) {
      console.warn('[Accounting Auto-Entry Warning]', accErr);
    }

    res.json({
      success: true,
      data: { order, challan, invoice },
      message: 'Sales Order approved, stock allocated FEFO, delivery challan & Mushak-6.3 invoice generated.',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to approve sales order', error: error.message });
  }
};
