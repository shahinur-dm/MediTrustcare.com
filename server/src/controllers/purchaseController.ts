import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { PurchaseOrder } from '../models/PurchaseOrder';
import { GoodsReceipt } from '../models/GoodsReceipt';
import { PurchaseInvoice } from '../models/PurchaseInvoice';
import { Batch } from '../models/Batch';
import { Supplier } from '../models/Supplier';
import { InventoryService } from '../services/inventoryService';
import { AccountingService } from '../services/accountingService';
import { logAudit } from '../services/auditService';

export const getPurchaseOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const orders = await PurchaseOrder.find()
      .populate('supplier', 'name code phone')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name code unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch purchase orders', error: error.message });
  }
};

export const createPurchaseOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const poNumber = `PO-${Date.now()}`;
    const { supplier, warehouse, items, expectedDeliveryDate, terms, notes } = req.body;

    let subtotal = 0;
    let vatTotal = 0;

    const processedItems = items.map((item: any) => {
      const lineSubtotal = item.orderedQuantity * item.unitPrice;
      const lineVat = (lineSubtotal * (item.vatPercentage || 0)) / 100;
      subtotal += lineSubtotal;
      vatTotal += lineVat;
      return {
        ...item,
        vatAmount: lineVat,
        totalAmount: lineSubtotal + lineVat,
      };
    });

    const grandTotal = subtotal + vatTotal;

    const order = await PurchaseOrder.create({
      poNumber,
      supplier,
      warehouse,
      items: processedItems,
      subtotal,
      vatTotal,
      grandTotal,
      status: 'pending_approval',
      expectedDeliveryDate,
      terms,
      notes,
      createdBy: req.user?._id,
    });

    await logAudit({
      userId: req.user?._id,
      userName: req.user?.name,
      userRole: req.user?.role,
      action: 'CREATE_PURCHASE_ORDER',
      module: 'Procurement',
      entityId: poNumber,
      details: `Created Purchase Order ${poNumber} for ${grandTotal} BDT`,
    });

    res.status(201).json({ success: true, data: order, message: 'Purchase Order created and awaiting approval' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create PO', error: error.message });
  }
};

export const approvePurchaseOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const order = await PurchaseOrder.findById(req.params.id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase Order not found' });
      return;
    }
    order.status = 'approved';
    order.approvedBy = req.user?._id;
    await order.save();
    res.json({ success: true, data: order, message: 'Purchase Order approved successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to approve PO', error: error.message });
  }
};

/**
 * Receive Goods against Purchase Order (GRN)
 * Increases stock and creates batches ONLY upon GRN receiving!
 */
export const receiveGoodsGRN = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { poId, challanNumber, challanDate, items, notes } = req.body;
    const po = await PurchaseOrder.findById(poId);
    if (!po) {
      res.status(404).json({ success: false, message: 'Purchase Order not found' });
      return;
    }

    const grnNumber = `GRN-${Date.now()}`;
    let grnTotal = 0;

    const grnItems = [];

    for (const item of items) {
      const lineTotal = item.acceptedQuantity * item.unitPrice;
      grnTotal += lineTotal;

      // 1. Create or update batch
      const batch = await Batch.create({
        batchNumber: item.batchNumber.toUpperCase().trim(),
        product: item.product,
        warehouse: po.warehouse,
        mfgDate: item.mfgDate,
        expDate: item.expDate,
        purchasePrice: item.unitPrice,
        mrp: item.mrp || item.unitPrice * 1.25,
        initialQuantity: item.acceptedQuantity,
        currentQuantity: item.acceptedQuantity,
        status: 'active',
      });

      // 2. Increase stock via Inventory Service
      await InventoryService.recordMovement({
        type: 'PURCHASE_RECEIPT',
        productId: item.product,
        batchId: batch._id.toString(),
        warehouseId: po.warehouse.toString(),
        quantity: item.acceptedQuantity,
        unitCost: item.unitPrice,
        referenceDocType: 'GoodsReceipt',
        referenceDocId: grnNumber,
        notes: `Received from ${po.poNumber} under Challan ${challanNumber}`,
        performedBy: req.user?._id,
      });

      grnItems.push({
        product: item.product,
        receivedQuantity: item.receivedQuantity,
        acceptedQuantity: item.acceptedQuantity,
        rejectedQuantity: item.rejectedQuantity || 0,
        batchNumber: item.batchNumber,
        mfgDate: item.mfgDate,
        expDate: item.expDate,
        unitPrice: item.unitPrice,
        totalAmount: lineTotal,
        qcNotes: item.qcNotes,
      });
    }

    const grn = await GoodsReceipt.create({
      grnNumber,
      purchaseOrder: po._id,
      supplier: po.supplier,
      warehouse: po.warehouse,
      challanNumber,
      challanDate: challanDate || new Date(),
      items: grnItems,
      qcStatus: 'passed',
      receivedBy: req.user?._id,
      notes,
    });

    // Update PO status
    po.status = 'received';
    await po.save();

    // 3. Automatically generate Purchase Invoice & Accounts Payable
    const invoiceNumber = `PINV-${Date.now()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // 30 days standard credit

    const purchaseInvoice = await PurchaseInvoice.create({
      invoiceNumber,
      grn: grn._id,
      purchaseOrder: po._id,
      supplier: po.supplier,
      subtotal: grnTotal,
      vatAmount: 0,
      grandTotal: grnTotal,
      paidAmount: 0,
      balanceAmount: grnTotal,
      paymentStatus: 'unpaid',
      dueDate,
    });

    // Update Supplier Balance (AP)
    await Supplier.findByIdAndUpdate(po.supplier, {
      $inc: { currentBalance: grnTotal },
    });

    // 4. Double Entry Accounting: Debit Inventory (Asset), Credit Accounts Payable (Liability)
    try {
      await AccountingService.recordJournalEntry({
        narration: `Purchase from Supplier via GRN ${grnNumber} / Invoice ${invoiceNumber}`,
        referenceType: 'PurchaseInvoice',
        referenceId: invoiceNumber,
        createdBy: req.user?._id,
        lines: [
          { accountCode: '1020', debit: grnTotal, credit: 0, description: 'Inventory Asset Stock Receipt' },
          { accountCode: '2010', debit: 0, credit: grnTotal, description: 'Accounts Payable - Supplier' },
        ],
      });
    } catch (accErr) {
      console.warn('[Accounting Auto-Entry Warning]', accErr);
    }

    res.status(201).json({
      success: true,
      data: { grn, purchaseInvoice },
      message: 'Goods received, inventory updated, and purchase invoice generated successfully',
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to process GRN', error: error.message });
  }
};
