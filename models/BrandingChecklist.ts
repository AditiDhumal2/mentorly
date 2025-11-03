// models/ProfessionalBranding.ts

import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBrandingTask {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: 'linkedin' | 'github' | 'leetcode' | 'internship' | 'resume';
  doneBy: string;
  optional: boolean;
  tutorial?: {
    title: string;
    platform: string;
    url: string;
  };
  order?: number;
}

export interface IBrandingChecklist extends Document {
  _id: Types.ObjectId;
  year: number;
  tasks: IBrandingTask[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  year: number;
  college: string;
  profiles: {
    linkedin?: string;
    github?: string;
    leetcode?: string;
    codechef?: string;
  };
  interests: string[];
  roadmapProgress: Array<{
    year: number;
    stepId: Types.ObjectId;
    completed: boolean;
    completedAt?: Date;
  }>;
  brandingProgress: Array<{
    taskId: Types.ObjectId;
    completed: boolean;
    completedAt?: Date;
  }>;
  savedResources: Array<{
    resourceId: Types.ObjectId;
    savedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const BrandingTaskSchema = new Schema<IBrandingTask>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['linkedin', 'github', 'leetcode', 'internship', 'resume'],
    required: true 
  },
  doneBy: { type: String, required: true },
  optional: { type: Boolean, default: false },
  tutorial: {
    title: String,
    platform: String,
    url: String
  },
  order: Number
}, { _id: true });

const BrandingChecklistSchema = new Schema<IBrandingChecklist>({
  year: { 
    type: Number, 
    required: true,
    enum: [1, 2, 3, 4]
  },
  tasks: [BrandingTaskSchema]
}, {
  timestamps: true
});

const StudentSchema = new Schema<IStudent>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['student', 'mentor', 'admin'], 
    default: 'student' 
  },
  year: { type: Number, required: true },
  college: { type: String, required: true },
  profiles: {
    linkedin: String,
    github: String,
    leetcode: String,
    codechef: String
  },
  interests: [String],
  roadmapProgress: [{
    year: Number,
    stepId: { type: Schema.Types.ObjectId, ref: 'Roadmap' },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  brandingProgress: [{
    taskId: { type: Schema.Types.ObjectId, ref: 'BrandingChecklist' },
    completed: { type: Boolean, default: false },
    completedAt: Date
  }],
  savedResources: [{
    resourceId: { type: Schema.Types.ObjectId, ref: 'Resource' },
    savedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

export const BrandingChecklist: Model<IBrandingChecklist> = 
  mongoose.models.BrandingChecklist || mongoose.model<IBrandingChecklist>('BrandingChecklist', BrandingChecklistSchema);

export const Student: Model<IStudent> = 
  mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);