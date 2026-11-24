import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  code: string; // Internal Item Code
  sku: string;
  barcode: string;
  category: string;
  subcategory?: string;
  brand: string;
  manufacturer: string;
  unit: string; // e.g. Bottle, Box, Strip, Piece, Vial
  packSize: number;
  cartonSize: number;
  purchasePrice: number;
  wholesalePrice: number;
  mrp: number; // Maximum Retail Price
  vatPercentage: number;
  
  // Pharma specific
  isPharmaceutical: boolean;
  genericName?: string;
  strength?: string; // e.g. 2% w/v, 500mg, 100ml
  dosageForm?: string; // Lotion, Soap, Cream, Tablet, Syrup, Injection
  requiresBatchTracking: boolean;
  requiresExpiryTracking: boolean;
  storageConditions?: string; // Normal, Cool (15-25°C), Cold (2-8°C)
  
  // Equipment specific
  isMedicalEquipment: boolean;
  modelNumber?: string;
  serialNumberRequired?: boolean;
  warrantyMonths?: number;
  
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  imageUrl?: string;
  description?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    barcode: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true },
    brand: { type: String, required: true, trim: true },
    manufacturer: { type: String, required: true, trim: true },
    unit: { type: String, required: true, default: 'Bottle' },
    packSize: { type: Number, required: true, default: 1 },
    cartonSize: { type: Number, required: true, default: 24 },
    purchasePrice: { type: Number, required: true, min: 0 },
    wholesalePrice: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    vatPercentage: { type: Number, default: 15 }, // BD NBR standard VAT rate
    
    isPharmaceutical: { type: Boolean, default: true },
    genericName: { type: String, trim: true },
    strength: { type: String, trim: true },
    dosageForm: { type: String, default: 'Lotion' },
    requiresBatchTracking: { type: Boolean, default: true },
    requiresExpiryTracking: { type: Boolean, default: true },
    storageConditions: { type: String, default: 'Store below 25°C in a dry place' },
    
    isMedicalEquipment: { type: Boolean, default: false },
    modelNumber: { type: String },
    serialNumberRequired: { type: Boolean, default: false },
    warrantyMonths: { type: Number, default: 0 },
    
    minStockLevel: { type: Number, default: 50 },
    maxStockLevel: { type: Number, default: 2000 },
    reorderPoint: { type: Number, default: 100 },
    imageUrl: { type: String },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive', 'discontinued'], default: 'active' },
  },
  { timestamps: true }
);

ProductSchema.index({ name: 'text', genericName: 'text', brand: 'text', sku: 1, barcode: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
