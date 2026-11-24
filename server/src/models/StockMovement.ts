import mongoose, { Schema, Document } from 'mongoose';
import { STOCK_MOVEMENT_TYPES } from '../config/constants';

export interface IStockMovement extends Document {
  movementNumber: string;
  type: typeof STOCK_MOVEMENT_TYPES[number];
  product: mongoose.Types.ObjectId;
  batch?: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  quantity: number; // positive for IN, negative for OUT
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalValue: number;
  referenceDocType: 'PurchaseOrder' | 'GoodsReceipt' | 'SalesOrder' | 'SalesInvoice' | 'SalesReturn' | 'PurchaseReturn' | 'StockTransfer' | 'StockAdjustment' | 'OpeningBalance';
  referenceDocId?: string;
  notes?: string;
  performedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const StockMovementSchema = new Schema<IStockMovement>(
  {
    movementNumber: { type: String, required: true, unique: true },
    type: { type: String, enum: STOCK_MOVEMENT_TYPES, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    quantity: { type: Number, required: true },
    previousStock: { type: Number, required: true },
    newStock: { type: Number, required: true },
    unitCost: { type: Number, default: 0 },
    totalValue: { type: Number, default: 0 },
    referenceDocType: {
      type: String,
      enum: ['PurchaseOrder', 'GoodsReceipt', 'SalesOrder', 'SalesInvoice', 'SalesReturn', 'PurchaseReturn', 'StockTransfer', 'StockAdjustment', 'OpeningBalance'],
      required: true,
    },
    referenceDocId: { type: String },
    notes: { type: String },
    performedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

StockMovementSchema.index({ product: 1, warehouse: 1, createdAt: -1 });

export const StockMovement = mongoose.model<IStockMovement>('StockMovement', StockMovementSchema);
