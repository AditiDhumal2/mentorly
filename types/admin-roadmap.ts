// types/admin-roadmap.ts
import type { 
  BaseResource, 
  BaseRoadmapStep, 
  BaseRoadmapData 
} from './roadmap-base';

// ========== COMMON TYPES ==========

export interface Resource extends BaseResource {}
export interface RoadmapStep extends BaseRoadmapStep {
  year: number; // Required in admin context
}

// ========== ADMIN-SPECIFIC TYPES ==========

export interface QuickActionResource {
  _id?: string;
  title: string;
  url: string;
  platform?: string;
  description?: string;
}

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

export interface Roadmap extends BaseRoadmapData {
  _id: string; // Required in admin context
  quickActions: QuickAction[];
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

// ========== ADMIN COMPONENT PROPS ==========

export interface AdminRoadmapStepProps {
  step: RoadmapStep;
  onEdit: (step: RoadmapStep) => void;
  onDelete: (stepId: string) => void;
  onReorder: (stepId: string, direction: 'up' | 'down') => void;
  isFirst: boolean;
  isLast: boolean;
}

export interface AdminQuickActionProps {
  action: QuickAction;
  onEdit: (action: QuickAction) => void;
  onDelete: (actionId: string) => void;
  onToggleActive: (actionId: string, isActive: boolean) => void;
}

export interface RoadmapStepFormProps {
  initialData?: RoadmapStep;
  onSubmit: (data: CreateRoadmapStepPayload | UpdateRoadmapStepPayload) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export interface QuickActionFormProps {
  initialData?: QuickAction;
  onSubmit: (data: CreateQuickActionPayload | UpdateQuickActionPayload) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export interface AdminRoadmapFilters {
  year?: number;
  language?: string;
  category?: string;
  search?: string;
}

// ========== BULK OPERATION TYPES ==========

export interface BulkStepOperation {
  stepIds: string[];
  operation: 'delete' | 'activate' | 'deactivate' | 'update-category';
  data?: any;
}

export interface BulkQuickActionOperation {
  actionIds: string[];
  operation: 'delete' | 'activate' | 'deactivate' | 'update-category';
  data?: any;
}

// ========== IMPORT/EXPORT TYPES ==========

export interface RoadmapImportData {
  year: number;
  language: string;
  steps: Omit<RoadmapStep, '_id'>[];
  quickActions: Omit<QuickAction, '_id'>[];
}

export interface RoadmapExportOptions {
  includeSteps: boolean;
  includeQuickActions: boolean;
  includeMetadata: boolean;
  format: 'json' | 'csv';
}

// ========== STATISTICS TYPES ==========

export interface RoadmapStatistics {
  totalRoadmaps: number;
  totalSteps: number;
  totalQuickActions: number;
  stepsByLanguage: { [language: string]: number };
  stepsByCategory: { [category: string]: number };
  stepsByYear: { [year: number]: number };
  averageStepsPerRoadmap: number;
  mostUsedResources: Array<{
    title: string;
    url: string;
    usageCount: number;
  }>;
}

export interface UsageStatistics {
  totalStudents: number;
  activeStudents: number;
  completionRate: number;
  mostPopularLanguage: string;
  averageCompletionTime: number;
  studentProgress: Array<{
    date: string;
    completedSteps: number;
    activeStudents: number;
  }>;
}

// ========== VALIDATION TYPES ==========

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RoadmapValidation {
  roadmap: ValidationResult;
  steps: {
    [stepId: string]: ValidationResult;
  };
  quickActions: {
    [actionId: string]: ValidationResult;
  };
}

// ========== TEMPLATE TYPES ==========

export interface RoadmapTemplate {
  id: string;
  name: string;
  description: string;
  year: number;
  language: string;
  steps: Omit<RoadmapStep, '_id'>[];
  quickActions: Omit<QuickAction, '_id'>[];
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: RoadmapTemplate[];
}