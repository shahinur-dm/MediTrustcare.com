import mongoose, { Schema, Document } from 'mongoose';

export interface IBatch extends Document {
  batchNumber: string;
  product: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  mfgDate: Date;
  expDate: Date;
  purchasePrice: number;
  mrp: number;
  initialQuantity: number;
  currentQuantity: number;
  reservedQuantity: number;
  status: 'active' | 'near_expiry' | 'expired' | 'recalled';
  createdAt: Date;
  updatedAt: Date;
}

const BatchSchema = new Schema<IBatch>(
  {
    batchNumber: { type: String, required: true, uppercase: true, trim: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    mfgDate: { type: Date, required: true },
    expDate: { type: Date, required: true },
    purchasePrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    initialQuantity: { type: Number, required: true, min: 0 },
    currentQuantity: { type: Number, required: true, min: 0 },
    reservedQuantity: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['active', 'near_expiry', 'expired', 'recalled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

BatchSchema.index({ product: 1, batchNumber: 1, warehouse: 1 }, { unique: true });
BatchSchema.index({ expDate: 1 });

export const Batch = mongoose.model<IBatch>('Batch', BatchSchema);
