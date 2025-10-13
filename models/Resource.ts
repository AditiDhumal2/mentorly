import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IResource extends Document {
  type: 'course' | 'internship' | 'portal' | 'newsletter';
  title: string;
  description: string;
  url: string;
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  free: boolean;
  certificate: boolean;
  rating: number;
  ratedBy: Array<{
    userId: Types.ObjectId;
    rating: number;
  }>;
  addedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>({
  type: { 
    type: String, 
    enum: ['course', 'internship', 'portal', 'newsletter'], 
    required: true 
  },
  title: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  tags: [String],
  level: { 
    type: String, 
    enum: ['beginner', 'intermediate', 'advanced'], 
    default: 'beginner' 
  },
  free: { type: Boolean, default: true },
  certificate: { type: Boolean, default: false },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  ratedBy: [{
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5 }
  }],
  addedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true
});

// Remove the duplicate export
export const Resource = mongoose.models.Resource || mongoose.model<IResource>('Resource', ResourceSchema);