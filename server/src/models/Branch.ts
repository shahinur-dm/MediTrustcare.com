import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string;
  code: string;
  address: string;
  district: string;
  phone: string;
  email: string;
  manager?: mongoose.Types.ObjectId;
  isHeadquarters: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BranchSchema = new Schema<IBranch>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    isHeadquarters: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Branch = mongoose.model<IBranch>('Branch', BranchSchema);
