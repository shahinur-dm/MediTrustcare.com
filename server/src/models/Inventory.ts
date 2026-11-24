import mongoose, { Schema, Document } from 'mongoose';

export interface IInventory extends Document {
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  damagedQuantity: number;
  returnedQuantity: number;
  averageCost: number;
  totalValuation: number;
  lastRestockedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InventorySchema = new Schema<IInventory>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    totalQuantity: { type: Number, default: 0, min: 0 },
    availableQuantity: { type: Number, default: 0, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    damagedQuantity: { type: Number, default: 0, min: 0 },
    returnedQuantity: { type: Number, default: 0, min: 0 },
    averageCost: { type: Number, default: 0, min: 0 },
    totalValuation: { type: Number, default: 0, min: 0 },
    lastRestockedAt: { type: Date },
  },
  { timestamps: true }
);

InventorySchema.index({ product: 1, warehouse: 1 }, { unique: true });

export const Inventory = mongoose.model<IInventory>('Inventory', InventorySchema);
