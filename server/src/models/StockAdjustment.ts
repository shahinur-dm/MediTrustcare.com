import mongoose, { Schema, Document } from 'mongoose';

export interface IStockAdjustment extends Document {
  adjustmentNumber: string;
  warehouse: mongoose.Types.ObjectId;
  reason: 'physical_count' | 'damaged' | 'expired' | 'theft' | 'sample_distribution' | 'other';
  items: {
    product: mongoose.Types.ObjectId;
    batch?: mongoose.Types.ObjectId;
    systemQuantity: number;
    countedQuantity: number;
    difference: number;
    unitCost: number;
    totalImpact: number;
  }[];
  totalImpactAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockAdjustmentSchema = new Schema<IStockAdjustment>(
  {
    adjustmentNumber: { type: String, required: true, unique: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    reason: {
      type: String,
      enum: ['physical_count', 'damaged', 'expired', 'theft', 'sample_distribution', 'other'],
      required: true,
    },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
        systemQuantity: { type: Number, required: true },
        countedQuantity: { type: Number, required: true },
        difference: { type: Number, required: true },
        unitCost: { type: Number, required: true },
        totalImpact: { type: Number, required: true },
      },
    ],
    totalImpactAmount: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const StockAdjustment = mongoose.model<IStockAdjustment>('StockAdjustment', StockAdjustmentSchema);
