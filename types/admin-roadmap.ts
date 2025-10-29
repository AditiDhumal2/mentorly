// types/admin-roadmap.ts

// Common resource types
export interface Resource {
  _id?: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'exercise' | 'quiz';
  description?: string;
  duration?: string;
}

export interface QuickActionResource {
  _id?: string;
  title: string;
  url: string;
  platform?: string;
  description?: string;
}

// Roadmap Step types
export interface RoadmapStep {
  _id?: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
  languageSpecific: boolean;
  resources: Resource[];
  prerequisites: string[];
  year: number;
  language: string;
  order?: number;
  applyToAllLanguages?: boolean;
}

// Quick Action types
export interface QuickAction {
  _id?: string;
  title: string;
  description: string;
  type: 'study' | 'quiz' | 'exercise' | 'video' | 'reading' | 'project';
  duration: string;
  icon: string;
  resources: QuickActionResource[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  isActive: boolean;
  year: number;
  language: string;
}

// Roadmap types
export interface Roadmap {
  _id: string;
  year: number;
  language: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  quickActions: QuickAction[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Server Action Response types (Simplified for Server Actions)
export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface RoadmapActionResponse extends ActionResponse {
  data?: Roadmap | null;
}

export interface RoadmapsActionResponse extends ActionResponse {
  data?: Roadmap[] | null;
}

// Action payload types
export type CreateRoadmapStepPayload = Omit<RoadmapStep, '_id'>;
export type UpdateRoadmapStepPayload = Partial<RoadmapStep>;

export type CreateQuickActionPayload = Omit<QuickAction, '_id'>;
export type UpdateQuickActionPayload = Partial<QuickAction>;

// Filter and query types
export interface RoadmapFilter {
  year?: number;
  language?: string;
  category?: string;
}

// Form data types for components
export interface RoadmapStepFormData {
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
  languageSpecific: boolean;
  resources: Omit<Resource, '_id'>[];
  prerequisites: string[];
  year: number;
  language: string;
  applyToAllLanguages?: boolean;
}

export interface QuickActionFormData {
  title: string;
  description: string;
  type: QuickAction['type'];
  duration: string;
  icon: string;
  resources: Omit<QuickActionResource, '_id'>[];
  difficulty: QuickAction['difficulty'];
  category: string;
  tags: string[];
  isActive: boolean;
  year: number;
  language: string;
}