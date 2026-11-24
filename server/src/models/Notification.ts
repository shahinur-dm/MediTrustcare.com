import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  title: string;
  message: string;
  type: 'low_stock' | 'near_expiry' | 'order_approval' | 'delivery_update' | 'payment_received' | 'system';
  severity: 'info' | 'warning' | 'error' | 'success';
  targetRole?: string;
  targetUser?: mongoose.Types.ObjectId;
  actionUrl?: string;
  isRead: boolean;
  metadata?: any;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['low_stock', 'near_expiry', 'order_approval', 'delivery_update', 'payment_received', 'system'],
      default: 'system',
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'error', 'success'],
      default: 'info',
    },
    targetRole: { type: String },
    targetUser: { type: Schema.Types.ObjectId, ref: 'User' },
    actionUrl: { type: String },
    isRead: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ targetRole: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
