import mongoose, { Schema, Document } from 'mongoose';

export interface ISalesReturn extends Document {
  returnNumber: string;
  salesInvoice?: mongoose.Types.ObjectId;
  salesOrder?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  items: {
    product: mongoose.Types.ObjectId;
    batch?: mongoose.Types.ObjectId;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    reason: 'damaged' | 'expired' | 'incorrect_item' | 'customer_cancel' | 'quality_issue';
    qcStatus: 'passed_for_restock' | 'damaged_scrap' | 'return_to_manufacturer';
  }[];
  grandTotal: number;
  refundStatus: 'pending' | 'adjusted_to_credit' | 'cash_refunded';
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesReturnSchema = new Schema<ISalesReturn>(
  {
    returnNumber: { type: String, required: true, unique: true },
    salesInvoice: { type: Schema.Types.ObjectId, ref: 'SalesInvoice' },
    salesOrder: { type: Schema.Types.ObjectId, ref: 'SalesOrder' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        batch: { type: Schema.Types.ObjectId, ref: 'Batch' },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        reason: {
          type: String,
          enum: ['damaged', 'expired', 'incorrect_item', 'customer_cancel', 'quality_issue'],
          required: true,
        },
        qcStatus: {
          type: String,
          enum: ['passed_for_restock', 'damaged_scrap', 'return_to_manufacturer'],
          default: 'passed_for_restock',
        },
      },
    ],
    grandTotal: { type: Number, required: true },
    refundStatus: {
      type: String,
      enum: ['pending', 'adjusted_to_credit', 'cash_refunded'],
      default: 'pending',
    },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SalesReturn = mongoose.model<ISalesReturn>('SalesReturn', SalesReturnSchema);
