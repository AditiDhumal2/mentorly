// models/Roadmap.ts
import mongoose, { Document, Schema } from 'mongoose';

// Quick Actions Interfaces
export interface IQuickActionResource {
  title: string;
  url: string;
  platform?: string;
  description?: string;
}

export interface IQuickAction {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'study' | 'quiz' | 'exercise' | 'video' | 'reading' | 'project';
  duration: string;
  icon: string;
  resources: IQuickActionResource[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  isActive: boolean;
  year?: number; // ✅ CHANGED: Make optional since it's at parent level
  language?: string; // ✅ CHANGED: Make optional since it's at parent level
}

// Original Roadmap Interfaces
export interface IResource {
  title: string;
  url: string;
  type: string;
  description?: string;
  duration?: string;
}

export interface IRoadmapStep {
  _id?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  resources: IResource[];
  estimatedDuration: string;
  priority: number;
  languageSpecific: boolean;
  prerequisites?: string[];
  applyToAllLanguages?: boolean;
  year?: number; // ✅ CHANGED: Make optional since it's at parent level
  language?: string; // ✅ CHANGED: Make optional since it's at parent level
}

export interface IRoadmap extends Document {
  year: number;
  language: string;
  title: string;
  description: string;
  steps: IRoadmapStep[];
  quickActions: IQuickAction[];
  createdAt: Date;
  updatedAt: Date;
}

// Quick Actions Schemas
const quickActionResourceSchema = new Schema<IQuickActionResource>({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  platform: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
  }
});

const quickActionSchema = new Schema<IQuickAction>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['study', 'quiz', 'exercise', 'video', 'reading', 'project']
  },
  duration: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  resources: [quickActionResourceSchema],
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  category: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  year: { // ✅ CHANGED: Remove required since it's redundant
    type: Number,
    required: false, // Changed from true to false
    min: 1,
    max: 4
  },
  language: { // ✅ CHANGED: Remove required since it's redundant
    type: String,
    required: false // Changed from true to false
  }
});

// Original Roadmap Schemas
const resourceSchema = new Schema<IResource>({
  title: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  duration: {
    type: String,
    required: false
  }
});

const roadmapStepSchema = new Schema<IRoadmapStep>({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  resources: [resourceSchema],
  estimatedDuration: {
    type: String,
    required: true
  },
  priority: {
    type: Number,
    required: true
  },
  languageSpecific: {
    type: Boolean,
    default: false
  },
  prerequisites: {
    type: [String],
    default: []
  },
  applyToAllLanguages: {
    type: Boolean,
    default: false
  },
  year: { // ✅ CHANGED: Remove required since it's redundant
    type: Number,
    required: false, // Changed from true to false
    min: 1,
    max: 4
  },
  language: { // ✅ CHANGED: Remove required since it's redundant
    type: String,
    required: false // Changed from true to false
  }
});

// Main Roadmap Schema
const roadmapSchema = new Schema<IRoadmap>({
  year: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  language: {
    type: String,
    required: true,
    default: 'python'
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  steps: [roadmapStepSchema],
  quickActions: [quickActionSchema]
}, {
  timestamps: true
});

// Compound index for efficient querying
roadmapSchema.index({ year: 1, language: 1 }, { unique: true });

export const Roadmap = mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', roadmapSchema);