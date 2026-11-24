import mongoose, { Schema, Document } from 'mongoose';

export interface IAccount extends Document {
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  subType: string;
  description?: string;
  balance: number;
  isSystem: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AccountSchema = new Schema<IAccount>(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'], required: true },
    subType: { type: String, required: true },
    description: { type: String },
    balance: { type: Number, default: 0 },
    isSystem: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Account = mongoose.model<IAccount>('Account', AccountSchema);
