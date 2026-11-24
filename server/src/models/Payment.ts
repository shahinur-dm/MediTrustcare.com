import mongoose, { Schema, Document } from 'mongoose';
import { PAYMENT_METHODS } from '../config/constants';

export interface IPayment extends Document {
  paymentNumber: string;
  type: 'CustomerCollection' | 'SupplierPayment' | 'ExpensePayment';
  method: typeof PAYMENT_METHODS[number];
  amount: number;
  date: Date;
  customer?: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  invoiceId?: string;
  referenceNumber?: string; // Cheque number / bKash TrxID / Bank deposit slip
  bankName?: string;
  branchName?: string;
  chequeDate?: Date;
  chequeStatus?: 'pending' | 'cleared' | 'bounced';
  mfsAccountNumber?: string;
  status: 'completed' | 'pending' | 'failed' | 'reversed';
  notes?: string;
  receivedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    paymentNumber: { type: String, required: true, unique: true },
    type: {
      type: String,
      enum: ['CustomerCollection', 'SupplierPayment', 'ExpensePayment'],
      required: true,
    },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    amount: { type: Number, required: true, min: 1 },
    date: { type: Date, default: Date.now },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer' },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    invoiceId: { type: String },
    referenceNumber: { type: String },
    bankName: { type: String },
    branchName: { type: String },
    chequeDate: { type: Date },
    chequeStatus: { type: String, enum: ['pending', 'cleared', 'bounced'] },
    mfsAccountNumber: { type: String },
    status: { type: String, enum: ['completed', 'pending', 'failed', 'reversed'], default: 'completed' },
    notes: { type: String },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema);
