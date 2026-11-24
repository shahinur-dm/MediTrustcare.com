import mongoose from 'mongoose';
import { Inventory } from '../models/Inventory';
import { Batch } from '../models/Batch';
import { StockMovement } from '../models/StockMovement';
import { Product } from '../models/Product';
import { createNotification } from './notificationService';

export class InventoryService {
  /**
   * Allocate stock using FEFO (First-Expiry-First-Out)
   */
  static async allocateStockFEFO(params: {
    productId: string;
    warehouseId: string;
    requestedQty: number;
  }): Promise<{ batchId: string; batchNumber: string; allocatedQty: number; expDate: Date }[]> {
    const { productId, warehouseId, requestedQty } = params;

    // Fetch active batches with available quantity > 0 sorted by expDate ascending
    const batches = await Batch.find({
      product: productId,
      warehouse: warehouseId,
      status: 'active',
      expDate: { $gt: new Date() }, // strictly never expired
      currentQuantity: { $gt: 0 },
    }).sort({ expDate: 1 });

    const allocations: { batchId: string; batchNumber: string; allocatedQty: number; expDate: Date }[] = [];
    let remainingNeeded = requestedQty;

    for (const batch of batches) {
      if (remainingNeeded <= 0) break;
      const takeQty = Math.min(batch.currentQuantity, remainingNeeded);
      allocations.push({
        batchId: (batch._id as mongoose.Types.ObjectId).toString(),
        batchNumber: batch.batchNumber,
        allocatedQty: takeQty,
        expDate: batch.expDate,
      });
      remainingNeeded -= takeQty;
    }

    if (remainingNeeded > 0) {
      throw new Error(`Insufficient non-expired stock in warehouse. Missing ${remainingNeeded} units.`);
    }

    return allocations;
  }

  /**
   * Process Stock Movement (IN/OUT/ADJUSTMENT) and update inventory & batch
   */
  static async recordMovement(params: {
    type: any;
    productId: string;
    batchId?: string;
    warehouseId: string;
    quantity: number; // positive for addition, negative for deduction
    referenceDocType: any;
    referenceDocId: string;
    unitCost?: number;
    notes?: string;
    performedBy?: any;
  }) {
    const { type, productId, batchId, warehouseId, quantity, referenceDocType, referenceDocId, unitCost = 0, notes, performedBy } = params;

    // 1. Find or create Inventory record
    let inv = await Inventory.findOne({ product: productId, warehouse: warehouseId });
    if (!inv) {
      inv = new Inventory({
        product: productId,
        warehouse: warehouseId,
        totalQuantity: 0,
        availableQuantity: 0,
        reservedQuantity: 0,
        damagedQuantity: 0,
        returnedQuantity: 0,
        averageCost: unitCost,
        totalValuation: 0,
      });
    }

    const previousStock = inv.totalQuantity;
    const newStock = previousStock + quantity;

    if (newStock < 0) {
      throw new Error(`Cannot deduct ${Math.abs(quantity)} units. Current inventory is ${previousStock}.`);
    }

    inv.totalQuantity = newStock;
    inv.availableQuantity = Math.max(0, inv.totalQuantity - inv.reservedQuantity);
    inv.totalValuation = Math.max(0, inv.totalQuantity * (inv.averageCost || unitCost));
    if (quantity > 0) {
      inv.lastRestockedAt = new Date();
    }
    await inv.save();

    // 2. Update Batch if specified
    if (batchId) {
      const batch = await Batch.findById(batchId);
      if (batch) {
        batch.currentQuantity = Math.max(0, batch.currentQuantity + quantity);
        if (batch.currentQuantity === 0) {
          // If all sold
        }
        await batch.save();
      }
    }

    // 3. Create StockMovement record
    const movementNumber = `MOV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const movement = await StockMovement.create({
      movementNumber,
      type,
      product: productId,
      batch: batchId,
      warehouse: warehouseId,
      quantity,
      previousStock,
      newStock,
      unitCost,
      totalValue: Math.abs(quantity * unitCost),
      referenceDocType,
      referenceDocId,
      notes,
      performedBy,
    });

    // 4. Low Stock Check
    const prod = await Product.findById(productId);
    if (prod && inv.availableQuantity <= prod.minStockLevel) {
      await createNotification({
        title: `Low Stock Alert: ${prod.name}`,
        message: `Current available stock is ${inv.availableQuantity} ${prod.unit}s (Min threshold: ${prod.minStockLevel}).`,
        type: 'low_stock',
        severity: 'warning',
        targetRole: 'Warehouse Manager',
        metadata: { productId, warehouseId, currentStock: inv.availableQuantity },
      });
    }

    return movement;
  }
}
