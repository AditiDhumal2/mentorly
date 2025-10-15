// models/Admins.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  permissions: {
    canManageUsers: boolean;
    canManageContent: boolean;
    canManageSystem: boolean;
    canViewAnalytics: boolean;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'admin',
  },
  permissions: {
    canManageUsers: { type: Boolean, default: true },
    canManageContent: { type: Boolean, default: true },
    canManageSystem: { type: Boolean, default: true },
    canViewAnalytics: { type: Boolean, default: true },
  },
  isActive: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true,
});

export const Admin = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', adminSchema);