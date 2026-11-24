import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesInvoice extends Document {
  invoiceNumber: string;
  mushakNumber: string; // Bangladesh NBR Mushak-6.3 Number
  salesOrder?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  branch: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  items: {
    product: mongoose.Types.ObjectId;
    batch?: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
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
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  deliveryStatus: 'pending' | 'dispatched' | 'delivered';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesInvoiceSchema = new Schema<ISalesInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    mushakNumber: { type: String, required: true },
    salesOrder: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
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
    balanceAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
    deliveryStatus: { type: String, enum: ['pending', 'dispatched', 'delivered'], default: 'pending' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SalesInvoiceSchema.index({ invoiceNumber: 1, mushakNumber: 1, customer: 1 });

export const SalesInvoice = mongoose.model<ISalesInvoice>('SalesInvoice', SalesInvoiceSchema);
