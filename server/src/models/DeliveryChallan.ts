import mongoose, { Schema, Document } from 'mongoose';
import { DELIVERY_STATUSES } from '../config/constants';

export interface IDeliveryChallan extends Document {
  challanNumber: string;
  salesOrder: mongoose.Types.ObjectId;
  salesInvoice?: mongoose.Types.ObjectId;
  customer: mongoose.Types.ObjectId;
  warehouse: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId; // User or Employee
  driverName?: string;
  driverPhone?: string;
  vehicle?: mongoose.Types.ObjectId;
  vehicleRegNumber?: string;
  routeArea: string;
  district: string;
  status: typeof DELIVERY_STATUSES[number];
  dispatchedAt?: Date;
  deliveredAt?: Date;
  proofOfDeliveryNotes?: string;
  proofOfDeliverySignature?: string;
  receiverName?: string;
  deliveryExpenses: number;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const DeliveryChallanSchema = new Schema<IDeliveryChallan>(
  {
    challanNumber: { type: String, required: true, unique: true },
    salesOrder: { type: Schema.Types.ObjectId, ref: 'SalesOrder', required: true },
    salesInvoice: { type: Schema.Types.ObjectId, ref: 'SalesInvoice' },
    customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'User' },
    driverName: { type: String },
    driverPhone: { type: String },
    vehicle: { type: Schema.Types.ObjectId, ref: 'Vehicle' },
    vehicleRegNumber: { type: String },
    routeArea: { type: String, required: true },
    district: { type: String, required: true },
    status: { type: String, enum: DELIVERY_STATUSES, default: 'pending' },
    dispatchedAt: { type: Date },
    deliveredAt: { type: Date },
    proofOfDeliveryNotes: { type: String },
    proofOfDeliverySignature: { type: String },
    receiverName: { type: String },
    deliveryExpenses: { type: Number, default: 0 },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export const DeliveryChallan = mongoose.model<IDeliveryChallan>('DeliveryChallan', DeliveryChallanSchema);
