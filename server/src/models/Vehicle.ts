import mongoose, { Schema, Document } from 'mongoose';

export interface IVehicle extends Document {
  registrationNumber: string;
  vehicleType: 'Covered Van' | 'Pickup' | 'Motorcycle' | 'Truck';
  brandModel: string;
  capacityKg: number;
  assignedDriver?: mongoose.Types.ObjectId;
  fuelType: 'Diesel' | 'Petrol' | 'Octane' | 'CNG';
  fitnessExpiry?: Date;
  taxTokenExpiry?: Date;
  insuranceExpiry?: Date;
  status: 'available' | 'on_delivery' | 'maintenance' | 'inactive';
  currentOdometer: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  createdAt: Date;
  updatedAt: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    registrationNumber: { type: String, required: true, unique: true, uppercase: true, trim: true },
    vehicleType: {
      type: String,
      enum: ['Covered Van', 'Pickup', 'Motorcycle', 'Truck'],
      default: 'Covered Van',
    },
    brandModel: { type: String, required: true },
    capacityKg: { type: Number, required: true, default: 1500 },
    assignedDriver: { type: Schema.Types.ObjectId, ref: 'User' },
    fuelType: { type: String, enum: ['Diesel', 'Petrol', 'Octane', 'CNG'], default: 'Diesel' },
    fitnessExpiry: { type: Date },
    taxTokenExpiry: { type: Date },
    insuranceExpiry: { type: Date },
    status: {
      type: String,
      enum: ['available', 'on_delivery', 'maintenance', 'inactive'],
      default: 'available',
    },
    currentOdometer: { type: Number, default: 0 },
    totalFuelCost: { type: Number, default: 0 },
    totalMaintenanceCost: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Vehicle = mongoose.model<IVehicle>('Vehicle', VehicleSchema);
