import mongoose, { Schema, Document } from 'mongoose';
import { ORDER_STATUSES } from '../config/constants';

export interface ISalesOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  salesRep?: mongoose.Types.ObjectId;
  orderDate: Date;
  deliveryDate?: Date;
  items: {
    product: mongoose.Types.ObjectId;
    batch?: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    discountPercent: number;
    discountAmount: number;
    vatPercent: number;
    vatAmount: number;
    totalAmount: number;
  }[];
  subtotal: number;
  totalDiscount: number;
  totalVat: number;
  grandTotal: number;
  paidAmount: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  status: typeof ORDER_STATUSES[number];
  deliveryStatus: 'pending' | 'assigned' | 'dispatched' | 'delivered' | 'returned';
  shippingAddress: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesOrderSchema = new Schema<ISalesOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    salesRep: { type: Schema.Types.ObjectId, ref: 'User' },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true, min: 0 },
        discountPercent: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
        vatPercent: { type: Number, default: 0 },
        vatAmount: { type: Number, default: 0 },
        totalAmount: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true },
    totalDiscount: { type: Number, default: 0 },
    totalVat: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    paymentStatus: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
    status: { type: String, enum: ORDER_STATUSES, default: 'pending_approval' },
    deliveryStatus: {
      type: String,
      enum: ['pending', 'assigned', 'dispatched', 'delivered', 'returned'],
      default: 'pending',
    },
    shippingAddress: { type: String, required: true },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

SalesOrderSchema.index({ orderNumber: 1, customer: 1, status: 1 });

export const SalesOrder = mongoose.model<ISalesOrder>('SalesOrder', SalesOrderSchema);
