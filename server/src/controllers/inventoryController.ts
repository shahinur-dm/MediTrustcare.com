import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Inventory } from '../models/Inventory';
import { StockMovement } from '../models/StockMovement';
import { StockTransfer } from '../models/StockTransfer';
import { StockAdjustment } from '../models/StockAdjustment';
import { InventoryService } from '../services/inventoryService';
import { logAudit } from '../services/auditService';

export const getInventorySummary = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { warehouse, search } = req.query;
    const query: any = {};
    if (warehouse) query.warehouse = warehouse;

    const inventory = await Inventory.find(query)
      .populate('product')
      .populate('warehouse', 'name code district')
      .sort({ updatedAt: -1 });

    const filtered = search
      ? inventory.filter((item: any) => {
          const p = item.product;
          return p && (p.name.toLowerCase().includes((search as string).toLowerCase()) || p.code.toLowerCase().includes((search as string).toLowerCase()));
        })
      : inventory;

    res.json({ success: true, data: filtered });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch inventory', error: error.message });
  }
};

export const getStockMovements = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { productId, warehouseId, type, limit = 100 } = req.query;
    const query: any = {};
    if (productId) query.product = productId;
    if (warehouseId) query.warehouse = warehouseId;
    if (type) query.type = type;

    const movements = await StockMovement.find(query)
      .populate('product', 'name code unit')
      .populate('batch', 'batchNumber expDate')
      .populate('warehouse', 'name code')
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({ success: true, data: movements });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch stock movements', error: error.message });
  }
};

export const createStockAdjustment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { warehouse, reason, items, notes } = req.body;
    const adjustmentNumber = `ADJ-${Date.now()}`;

    let totalImpact = 0;
    const processedItems = items.map((item: any) => {
      const diff = item.countedQuantity - item.systemQuantity;
      const impact = diff * item.unitCost;
      totalImpact += impact;
      return {
        ...item,
        difference: diff,
        totalImpact: impact,
      };
    });

    const adjustment = await StockAdjustment.create({
      adjustmentNumber,
      warehouse,
      reason,
      items: processedItems,
      totalImpactAmount: totalImpact,
      status: 'approved', // auto-approve for authorized managers
      requestedBy: req.user?._id,
      approvedBy: req.user?._id,
      notes,
    });

    // Update stock via movement service
    for (const item of processedItems) {
      if (item.difference !== 0) {
        await InventoryService.recordMovement({
          type: item.difference > 0 ? 'ADJUSTMENT_ADD' : 'ADJUSTMENT_SUBTRACT',
          productId: item.product,
          batchId: item.batch,
          warehouseId: warehouse,
          quantity: item.difference,
          unitCost: item.unitCost,
          referenceDocType: 'StockAdjustment',
          referenceDocId: adjustmentNumber,
          notes: `Stock Adjustment: ${reason}`,
          performedBy: req.user?._id,
        });
      }
    }

    res.status(201).json({ success: true, data: adjustment, message: 'Stock adjustment applied successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to create adjustment', error: error.message });
  }
};

export const createStockTransfer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { sourceWarehouse, targetWarehouse, items, notes } = req.body;
    if (sourceWarehouse === targetWarehouse) {
      res.status(400).json({ success: false, message: 'Source and destination warehouses cannot be the same.' });
      return;
    }

    const transferNumber = `TRF-${Date.now()}`;
    const transfer = await StockTransfer.create({
      transferNumber,
      sourceWarehouse,
      targetWarehouse,
      items,
      requestedBy: req.user?._id,
      status: 'approved',
      notes,
    });

    // Execute transfer movements
    for (const item of items) {
      // Deduct from source
      await InventoryService.recordMovement({
        type: 'STOCK_TRANSFER_OUT',
        productId: item.product,
        batchId: item.batch,
        warehouseId: sourceWarehouse,
        quantity: -item.quantity,
        referenceDocType: 'StockTransfer',
        referenceDocId: transferNumber,
        notes: `Transfer to ${targetWarehouse}`,
        performedBy: req.user?._id,
      });

      // Add to destination
      await InventoryService.recordMovement({
        type: 'STOCK_TRANSFER_IN',
        productId: item.product,
        batchId: item.batch,
        warehouseId: targetWarehouse,
        quantity: item.quantity,
        referenceDocType: 'StockTransfer',
        referenceDocId: transferNumber,
        notes: `Transfer from ${sourceWarehouse}`,
        performedBy: req.user?._id,
      });
    }

    res.status(201).json({ success: true, data: transfer, message: 'Stock transfer executed successfully' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Failed to execute transfer', error: error.message });
  }
};
