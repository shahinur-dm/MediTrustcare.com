import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSetting extends Document {
  key: string;
  category: 'general' | 'vat' | 'invoice' | 'notification' | 'security';
  value: any;
  description?: string;
  updatedBy?: mongoose.Types.ObjectId;
  updatedAt: Date;
}

const SystemSettingSchema = new Schema<ISystemSetting>(
  {
    key: { type: String, required: true, unique: true },
    category: {
      type: String,
      enum: ['general', 'vat', 'invoice', 'notification', 'security'],
      default: 'general',
    },
    value: { type: Schema.Types.Mixed, required: true },
    description: { type: String },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const SystemSetting = mongoose.model<ISystemSetting>('SystemSetting', SystemSettingSchema);
