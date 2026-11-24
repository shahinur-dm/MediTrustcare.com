import mongoose, { Schema, Document } from 'mongoose';

export interface IGoodsReceipt extends Document {
  grnNumber: string;
  purchaseOrder: mongoose.Types.ObjectId;
  supplier: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  challanNumber: string; // Supplier's delivery challan
  challanDate: Date;
  receiveDate: Date;
  items: {
    product: mongoose.Types.ObjectId;
    receivedQuantity: number;
    acceptedQuantity: number;
    rejectedQuantity: number;
    batchNumber: string;
    mfgDate: Date;
    expDate: Date;
    unitPrice: number;
    totalAmount: number;
    qcNotes?: string;
  }[];
  qcStatus: 'passed' | 'partial' | 'failed';
  receivedBy: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoodsReceiptSchema = new Schema<IGoodsReceipt>(
  {
    grnNumber: { type: String, required: true, unique: true },
    purchaseOrder: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder', required: true },
    supplier: { type: Schema.Types.ObjectId, ref: 'Supplier', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    challanNumber: { type: String, required: true },
    challanDate: { type: Date, required: true },
    receiveDate: { type: Date, default: Date.now },
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        receivedQuantity: { type: Number, required: true },
        acceptedQuantity: { type: Number, required: true },
        rejectedQuantity: { type: Number, default: 0 },
        batchNumber: { type: String, required: true },
        mfgDate: { type: Date, required: true },
        expDate: { type: Date, required: true },
        unitPrice: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
        qcNotes: { type: String },
      },
    ],
    qcStatus: { type: String, enum: ['passed', 'partial', 'failed'], default: 'passed' },
    receivedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export const GoodsReceipt = mongoose.model<IGoodsReceipt>('GoodsReceipt', GoodsReceiptSchema);
