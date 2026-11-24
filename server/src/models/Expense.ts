import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  expenseNumber: string;
  category: 'Rent' | 'Utilities' | 'Fuel & Transport' | 'Salaries' | 'Packaging' | 'Marketing' | 'Maintenance' | 'Office Supplies' | 'Miscellaneous';
  title: string;
  amount: number;
  date: Date;
  paidVia: 'cash' | 'bank_transfer' | 'cheque' | 'bkash' | 'nagad';
  paidTo: string;
  receiptNumber?: string;
  approvedBy?: mongoose.Types.ObjectId;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    expenseNumber: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['Rent', 'Utilities', 'Fuel & Transport', 'Salaries', 'Packaging', 'Marketing', 'Maintenance', 'Office Supplies', 'Miscellaneous'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, default: Date.now },
    paidVia: { type: String, enum: ['cash', 'bank_transfer', 'cheque', 'bkash', 'nagad'], default: 'cash' },
    paidTo: { type: String, required: true },
    receiptNumber: { type: String },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
