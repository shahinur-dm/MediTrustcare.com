import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  code: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  district: string;
  binNumber?: string;
  tinNumber?: string;
  tradeLicense?: string;
  drugLicense?: string;
  bankDetails?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    branchName: string;
    routingNumber?: string;
  };
  paymentTermsDays: number;
  creditLimit: number;
  currentBalance: number; // positive = we owe them (AP)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    binNumber: { type: String },
    tinNumber: { type: String },
    tradeLicense: { type: String },
    drugLicense: { type: String },
    bankDetails: {
      bankName: { type: String },
      accountName: { type: String },
      accountNumber: { type: String },
      branchName: { type: String },
      routingNumber: { type: String },
    },
    paymentTermsDays: { type: Number, default: 30 },
    creditLimit: { type: Number, default: 1000000 },
    currentBalance: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

SupplierSchema.index({ name: 'text', code: 'text', phone: 'text' });

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);
