import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseOrder extends Document {
  poNumber: string;
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  items: {
    product: mongoose.Types.ObjectId;
    orderedQuantity: number;
    receivedQuantity: number;
    unitPrice: number;
    vatPercentage: number;
    vatAmount: number;
    totalAmount: number;
  }[];
  subtotal: number;
  vatTotal: number;
  discountAmount: number;
  grandTotal: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'partially_received' | 'received' | 'cancelled';
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  terms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, unique: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        orderedQuantity: { type: Number, required: true, min: 1 },
        receivedQuantity: { type: Number, default: 0 },
        unitPrice: { type: Number, required: true, min: 0 },
        vatPercentage: { type: Number, default: 0 },
        vatAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    vatTotal: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    status: {
      type: String,
      enum: ['draft', 'pending_approval', 'approved', 'partially_received', 'received', 'cancelled'],
      default: 'draft',
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    terms: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);
