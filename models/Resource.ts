// models/Resource.ts
import mongoose, { Document, Schema, Model } from 'mongoose';

export interface ResourceRating {
  userId: mongoose.Types.ObjectId;
  rating: number;
}

export interface IResourceDocument extends Document {
  title: string;
  description: string;
  url: string;
  type: 'course' | 'internship' | 'portal' | 'newsletter';
  tags: string[];
  level: 'beginner' | 'intermediate' | 'advanced';
  free: boolean;
  certificate: boolean;
  rating?: number;
  ratedBy: ResourceRating[];
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot be more than 1000 characters'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      validate: {
        validator: function(v: string) {
          return /^https?:\/\/.+\..+/.test(v);
        },
        message: 'Please enter a valid URL',
      },
    },
    type: {
      type: String,
      enum: {
        values: ['course', 'internship', 'portal', 'newsletter'],
        message: 'Type must be course, internship, portal, or newsletter',
      },
      required: true,
    },
    tags: [{
      type: String,
      trim: true,
    }],
    level: {
      type: String,
      enum: {
        values: ['beginner', 'intermediate', 'advanced'],
        message: 'Level must be beginner, intermediate, or advanced',
      },
      default: 'beginner',
    },
    free: {
      type: Boolean,
      default: true,
    },
    certificate: {
      type: Boolean,
      default: false,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    ratedBy: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
    }],
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
ResourceSchema.index({ type: 1, level: 1, free: 1 });
ResourceSchema.index({ tags: 1 });
ResourceSchema.index({ createdAt: -1 });

const Resource: Model<IResourceDocument> = mongoose.models.Resource || mongoose.model<IResourceDocument>('Resource', ResourceSchema);

export default Resource;