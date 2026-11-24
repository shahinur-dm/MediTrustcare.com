import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  name: string;
  description: string;
  permissions: {
    module: string;
    actions: ('view' | 'create' | 'edit' | 'delete' | 'approve' | 'export' | 'print')[];
  }[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoleSchema = new Schema<IRole>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: '' },
    permissions: [
      {
        module: { type: String, required: true },
        actions: [{ type: String, enum: ['view', 'create', 'edit', 'delete', 'approve', 'export', 'print'] }],
      },
    ],
    isSystem: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Role = mongoose.model<IRole>('Role', RoleSchema);
