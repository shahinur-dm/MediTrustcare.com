import mongoose, { Schema, Document } from 'mongoose';

export interface IStockTransfer extends Document {
  transferNumber: string;
  sourceWarehouse: mongoose.Types.ObjectId;
  targetWarehouse: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    batch?: mongoose.Types.ObjectId;
    quantity: number;
  }[];
  status: 'requested' | 'approved' | 'in_transit' | 'received' | 'rejected';
  requestedBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  dispatchedAt?: Date;
  receivedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransferSchema = new Schema<IStockTransfer>(
  {
    transferNumber: { type: String, required: true, unique: true },
    sourceWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    targetWarehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: {
      type: String,
      enum: ['requested', 'approved', 'in_transit', 'received', 'rejected'],
      default: 'requested',
    },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    dispatchedAt: { type: Date },
    receivedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const StockTransfer = mongoose.model<IStockTransfer>('StockTransfer', StockTransferSchema);
