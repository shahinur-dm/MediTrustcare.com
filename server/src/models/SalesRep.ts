import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesRep extends Document {
  user: mongoose.Types.ObjectId;
  employeeCode: string;
  territory: string;
  districts: string[];
  monthlySalesTarget: number;
  currentMonthSales: number;
  commissionRate: number; // percentage
  earnedCommission: number;
  totalOrdersBooked: number;
  status: 'active' | 'on_leave' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

const SalesRepSchema = new Schema<ISalesRep>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    employeeCode: { type: String, required: true, unique: true, uppercase: true },
    territory: { type: String, required: true },
    districts: [{ type: String }],
    monthlySalesTarget: { type: Number, default: 500000 },
    currentMonthSales: { type: Number, default: 0 },
    commissionRate: { type: Number, default: 2.5 },
    earnedCommission: { type: Number, default: 0 },
    totalOrdersBooked: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'on_leave', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

export const SalesRep = mongoose.model<ISalesRep>('SalesRep', SalesRepSchema);
