import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { SalesReturn } from '../models/SalesReturn';
import { PurchaseReturn } from '../models/PurchaseReturn';
import { Customer } from '../models/Customer';
import { Supplier } from '../models/Supplier';
import { InventoryService } from '../services/inventoryService';

export const getSalesReturns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const returns = await SalesReturn.find()
      .populate('customer', 'name code phone')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name code unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch sales returns', error: error.message });
  }
};

export const createSalesReturn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { customer, warehouse, salesInvoice, items, notes } = req.body;
    const returnNumber = `SRET-${Date.now()}`;

    let grandTotal = 0;
    const processedItems = items.map((i: any) => {
      const line = i.quantity * i.unitPrice;
      grandTotal += line;
      return {
        ...i,
        totalAmount: line,
      };
    });

    const salesReturn = await SalesReturn.create({
      returnNumber,
      customer,
      warehouse,
      salesInvoice,
      items: processedItems,
      grandTotal,
      status: 'approved',
      refundStatus: 'adjusted_to_credit',
      notes,
      createdBy: req.user?._id,
      approvedBy: req.user?._id,
    });

    // Process restocking for items passed QC
    for (const item of processedItems) {
      if (item.qcStatus === 'passed_for_restock') {
        await InventoryService.recordMovement({
          type: 'SALES_RETURN',
          productId: item.product,
          batchId: item.batch,
          warehouseId: warehouse,
          quantity: item.quantity,
          unitCost: item.unitPrice,
          referenceDocType: 'SalesReturn',
          referenceDocId: returnNumber,
          notes: `Sales return restocking: ${item.reason}`,
          performedBy: req.user?._id,
        });
      }
    }

    // Adjust customer balance
    await Customer.findByIdAndUpdate(customer, {
      $inc: { currentBalance: -grandTotal },
    });

    res.status(201).json({ success: true, data: salesReturn, message: 'Sales return processed and customer credit adjusted' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create sales return', error: error.message });
  }
};

export const getPurchaseReturns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const returns = await PurchaseReturn.find()
      .populate('supplier', 'name code phone')
      .populate('warehouse', 'name code')
      .populate('items.product', 'name code unit')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: returns });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch purchase returns', error: error.message });
  }
};
