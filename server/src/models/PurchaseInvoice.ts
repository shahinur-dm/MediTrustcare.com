import mongoose, { Schema, Document } from 'mongoose';

export interface IPurchaseInvoice extends Document {
  invoiceNumber: string;
  grn?: mongoose.Types.ObjectId;
  purchaseOrder?: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  invoiceDate: Date;
  dueDate: Date;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: 'unpaid' | 'partially_paid' | 'paid';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseInvoiceSchema = new Schema<IPurchaseInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    grn: { type: Schema.Types.ObjectId, ref: 'GoodsReceipt' },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    subtotal: { type: Number, required: true },
    vatAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    balanceAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['unpaid', 'partially_paid', 'paid'], default: 'unpaid' },
    notes: { type: String },
  },
  { timestamps: true }
);

export const PurchaseInvoice = mongoose.model<IPurchaseInvoice>('PurchaseInvoice', PurchaseInvoiceSchema);
