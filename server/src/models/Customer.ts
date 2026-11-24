import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  code: string;
  name: string;
  customerType: 'pharmacy' | 'hospital' | 'clinic' | 'distributor' | 'retail_individual';
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  deliveryAddress: string;
  district: string;
  upazila: string;
  binNumber?: string;
  tinNumber?: string;
  drugLicense?: string;
  tradeLicense?: string;
  assignedSalesRep?: mongoose.Types.ObjectId;
  creditLimit: number;
  creditDays: number;
  currentBalance: number; // positive = they owe us (AR)
  discountRate: number; // percentage
  status: 'active' | 'suspended' | 'blacklisted';
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    customerType: {
      type: String,
      enum: ['pharmacy', 'hospital', 'clinic', 'distributor', 'retail_individual'],
      default: 'pharmacy',
    },
    contactPerson: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String },
    deliveryAddress: { type: String, required: true },
    district: { type: String, required: true },
    upazila: { type: String, required: true },
    binNumber: { type: String },
    tinNumber: { type: String },
    drugLicense: { type: String },
    tradeLicense: { type: String },
    assignedSalesRep: { type: Schema.Types.ObjectId, ref: 'User' },
    creditLimit: { type: Number, default: 200000 },
    creditDays: { type: Number, default: 15 },
    currentBalance: { type: Number, default: 0 },
    discountRate: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'suspended', 'blacklisted'], default: 'active' },
  },
  { timestamps: true }
);

CustomerSchema.index({ name: 'text', code: 'text', phone: 'text' });

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
