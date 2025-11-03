// types/professional-branding.ts

export interface BrandingTask {
  _id: string;
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

export interface BrandingChecklist {
  _id: string;
  year: number;
  tasks: BrandingTask[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AdminBrandingChecklist extends BrandingChecklist {
  createdAt: Date;
  updatedAt: Date;
}

export interface UserBrandingProgress {
  taskId: string;
  completed: boolean;
  completedAt?: Date;
}

export interface BrandingProgressStats {
  completed: number;
  total: number;
  percentage: number;
}

export interface BrandingFormData {
  year: number;
  tasks: Omit<BrandingTask, '_id'>[];
}

export interface BrandingChecklistResponse {
  success: boolean;
  checklist?: BrandingChecklist;
  progress?: BrandingProgressStats;
  userProgress?: UserBrandingProgress[];
  error?: string;
}

export interface AdminChecklistsResponse {
  success: boolean;
  checklists?: AdminBrandingChecklist[];
  error?: string;
}