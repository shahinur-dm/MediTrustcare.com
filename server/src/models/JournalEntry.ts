import mongoose, { Schema, Document } from 'mongoose';

export interface IJournalEntry extends Document {
  entryNumber: string;
  date: Date;
  narration: string;
  referenceType?: 'SalesInvoice' | 'PurchaseInvoice' | 'PaymentReceipt' | 'PaymentVoucher' | 'SalesReturn' | 'PurchaseReturn' | 'Manual';
  referenceId?: string;
  lines: {
    account: mongoose.Types.ObjectId;
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    description?: string;
  }[];
  totalDebit: number;
  totalCredit: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JournalEntrySchema = new Schema<IJournalEntry>(
  {
    entryNumber: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    narration: { type: String, required: true },
    referenceType: {
      type: String,
      enum: ['SalesInvoice', 'PurchaseInvoice', 'PaymentReceipt', 'PaymentVoucher', 'SalesReturn', 'PurchaseReturn', 'Manual'],
      default: 'Manual',
    },
    referenceId: { type: String },
    lines: [
      {
        account: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
        accountCode: { type: String, required: true },
        accountName: { type: String, required: true },
        debit: { type: Number, default: 0, min: 0 },
        credit: { type: Number, default: 0, min: 0 },
        description: { type: String },
      },
    ],
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

JournalEntrySchema.pre<IJournalEntry>('validate', function (next) {
  const diff = Math.abs(this.totalDebit - this.totalCredit);
  if (diff > 0.01) {
    next(new Error(`Unbalanced Journal Entry: Total Debit (${this.totalDebit}) must equal Total Credit (${this.totalCredit})`));
  } else {
    next();
  }
});

export const JournalEntry = mongoose.model<IJournalEntry>('JournalEntry', JournalEntrySchema);
