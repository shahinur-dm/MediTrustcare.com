import mongoose, { Schema, Document } from 'mongoose';

export interface IEmployee extends Document {
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  nidNumber: string;
  department: 'Administration' | 'Sales & Marketing' | 'Supply Chain' | 'Accounts & Finance' | 'Distribution & Logistics' | 'Human Resources';
  designation: string;
  branch: mongoose.Types.ObjectId;
  joiningDate: Date;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  transportAllowance: number;
  totalGrossSalary: number;
  status: 'active' | 'on_leave' | 'terminated';
  leaveBalance: {
    casual: number;
    sick: number;
    earned: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    employeeCode: { type: String, required: true, unique: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nidNumber: { type: String, required: true },
    department: {
      type: String,
      enum: ['Administration', 'Sales & Marketing', 'Supply Chain', 'Accounts & Finance', 'Distribution & Logistics', 'Human Resources'],
      required: true,
    },
    designation: { type: String, required: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    joiningDate: { type: Date, required: true },
    basicSalary: { type: Number, required: true },
    houseRentAllowance: { type: Number, default: 0 },
    medicalAllowance: { type: Number, default: 0 },
    transportAllowance: { type: Number, default: 0 },
    totalGrossSalary: { type: Number, required: true },
    status: { type: String, enum: ['active', 'on_leave', 'terminated'], default: 'active' },
    leaveBalance: {
      casual: { type: Number, default: 10 },
      sick: { type: Number, default: 14 },
      earned: { type: Number, default: 15 },
    },
  },
  { timestamps: true }
);

export const Employee = mongoose.model<IEmployee>('Employee', EmployeeSchema);
