import mongoose, { Schema, Document } from 'mongoose';

export interface IWarehouse extends Document {
  name: string;
  code: string;
  branch: mongoose.Types.ObjectId;
  address: string;
  district: string;
  manager?: mongoose.Types.ObjectId;
  phone: string;
  capacitySqFt: number;
  temperatureControlled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const WarehouseSchema = new Schema<IWarehouse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    address: { type: String, required: true },
    district: { type: String, required: true },
    manager: { type: Schema.Types.ObjectId, ref: 'User' },
    phone: { type: String, required: true },
    capacitySqFt: { type: Number, default: 5000 },
    temperatureControlled: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Warehouse = mongoose.model<IWarehouse>('Warehouse', WarehouseSchema);
