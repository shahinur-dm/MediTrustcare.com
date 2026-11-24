import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone: string;
  role: string;
  branch?: mongoose.Types.ObjectId;
  warehouse?: mongoose.Types.ObjectId;
  isActive: boolean;
  avatar?: string;
  refreshTokens: string[];
  lastLogin?: Date;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String, required: true, trim: true },
    role: { type: String, required: true, default: 'Sales Executive' },
    branch: { type: Schema.Types.ObjectId, ref: 'Branch' },
    warehouse: { type: Schema.Types.ObjectId, ref: 'Warehouse' },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    refreshTokens: [{ type: String }],
    lastLogin: { type: Date },
  },
  { timestamps: true }
);

UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
