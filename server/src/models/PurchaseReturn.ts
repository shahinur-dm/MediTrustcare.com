import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseReturn extends Document {
  returnNumber: string;
  purchaseInvoice?: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    batch?: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    reason: string;
  }[];
  grandTotal: number;
  refundStatus: 'pending' | 'adjusted_to_payable' | 'refunded';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseReturnSchema = new Schema<IPurchaseReturn>(
  {
    returnNumber: { type: String, required: true, unique: true },
    purchaseInvoice: { type: Schema.Types.ObjectId, ref: 'PurchaseInvoice' },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        reason: { type: String, required: true },
      },
    ],
    grandTotal: { type: Number, required: true },
    refundStatus: {
      type: String,
      enum: ['pending', 'adjusted_to_payable', 'refunded'],
      default: 'pending',
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const PurchaseReturn = mongoose.model<IPurchaseReturn>('PurchaseReturn', PurchaseReturnSchema);
