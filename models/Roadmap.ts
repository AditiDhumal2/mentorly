import mongoose, { Document, Schema } from 'mongoose';

export interface IResource {
  title: string;
  url: string;
  type: string;
}

export interface IRoadmapStep {
  title: string;
  description: string;
  category: string;
  resources: IResource[];
  estimatedDuration: string;
  priority: number;
  languageSpecific: boolean;
}

export interface IRoadmap extends Document {
  year: number;
  language: string;
  title: string;
  description: string;
  steps: IRoadmapStep[];
  createdAt: Date;
  updatedAt: Date;
}

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
  resources: [resourceSchema], // This should be an array of resource objects
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
  }
});

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
  steps: [roadmapStepSchema] // This should be an array of step objects
}, {
  timestamps: true
});

// Compound index for efficient querying
roadmapSchema.index({ year: 1, language: 1 }, { unique: true });

export const Roadmap = mongoose.models.Roadmap || mongoose.model<IRoadmap>('Roadmap', roadmapSchema);