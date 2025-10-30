// types/roadmap-base.ts
import { Types } from 'mongoose';

// ========== COMMON BASE TYPES ==========

export interface BaseResource {
  _id?: string | Types.ObjectId;
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'exercise' | 'quiz';
  description?: string;
  duration?: string;
}

export interface BaseRoadmapStep {
  _id?: string | Types.ObjectId;
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
  languageSpecific: boolean;
  resources: BaseResource[];
  prerequisites: string[];
  year?: number;
  language: string; // Required in base type
  order?: number;
  applyToAllLanguages?: boolean;
}

export interface BaseRoadmapData {
  _id?: string | Types.ObjectId;
  year: number;
  language: string;
  title: string;
  description: string;
  steps: BaseRoadmapStep[];
  createdAt?: Date;
  updatedAt?: Date;
}

// ========== MONGODB-SPECIFIC TYPES ==========

// Base MongoDB document without quickActions (for student context)
export interface RoadmapDocument {
  _id: Types.ObjectId;
  year: number;
  language: string;
  title: string;
  description: string;
  steps: Array<{
    _id: Types.ObjectId;
    title: string;
    description: string;
    category: string;
    resources: Array<{
      _id?: Types.ObjectId;
      title: string;
      url: string;
      type: string;
      description?: string;
      duration?: string;
    }>;
    estimatedDuration: string;
    priority: number;
    languageSpecific: boolean;
    prerequisites: string[];
    year?: number;
    language?: string; // Optional in MongoDB document
    order?: number;
    applyToAllLanguages?: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// Extended MongoDB document with quickActions (for admin context)
export interface RoadmapDocumentWithQuickActions extends RoadmapDocument {
  quickActions?: Array<{
    _id?: Types.ObjectId;
    title: string;
    description: string;
    type: string;
    duration: string;
    icon: string;
    resources: Array<{
      _id?: Types.ObjectId;
      title: string;
      url: string;
      platform?: string;
      description?: string;
    }>;
    difficulty: string;
    category: string;
    tags: string[];
    isActive: boolean;
    year: number;
    language: string;
  }>;
}

// ========== TRANSFORMATION UTILITIES ==========

export function transformRoadmapDocumentToData(doc: RoadmapDocument): BaseRoadmapData {
  return {
    _id: doc._id.toString(),
    year: doc.year,
    language: doc.language,
    title: doc.title,
    description: doc.description,
    steps: doc.steps.map(step => ({
      _id: step._id.toString(),
      title: step.title,
      description: step.description,
      category: step.category,
      priority: step.priority,
      estimatedDuration: step.estimatedDuration,
      languageSpecific: step.languageSpecific,
      resources: step.resources.map(resource => ({
        _id: resource._id?.toString(),
        title: resource.title,
        url: resource.url,
        type: resource.type as 'video' | 'article' | 'documentation' | 'exercise' | 'quiz',
        description: resource.description,
        duration: resource.duration
      })),
      prerequisites: step.prerequisites,
      year: step.year,
      language: step.language || doc.language, // Fallback to roadmap language if step language is undefined
      order: step.order,
      applyToAllLanguages: step.applyToAllLanguages
    })),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt
  };
}

export function transformRoadmapDocumentWithQuickActions(doc: RoadmapDocumentWithQuickActions): any {
  return {
    ...transformRoadmapDocumentToData(doc),
    quickActions: (doc.quickActions || []).map((action: any) => ({
      ...action,
      _id: action._id?.toString(),
      resources: (action.resources || []).map((resource: any) => ({
        ...resource,
        _id: resource._id?.toString()
      }))
    }))
  };
}