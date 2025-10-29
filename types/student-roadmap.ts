// types/student-roadmap.ts

// ========== CORE DATA TYPES ==========

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'quiz' | 'exercise' | 'video' | 'reading' | 'project';
  duration: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  isActive: boolean;
  points: number;
  link?: string;
  resourceUrl?: string;
  targetResource?: string;
  targetLanguage?: string;
  targetYear?: number;
}

export interface Resource {
  _id?: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'exercise' | 'quiz';
  description?: string;
  duration?: string;
}

export interface RoadmapStep {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
  languageSpecific: boolean;
  resources: Resource[];
  prerequisites: string[];
  year?: number; // Changed from required to optional
  language: string;
  order?: number;
  applyToAllLanguages?: boolean;
}

export interface RoadmapData {
  _id?: string;
  year: number;
  language: string;
  title: string;
  description: string;
  steps: RoadmapStep[];
  createdAt?: Date;
  updatedAt?: Date;
  isFallback?: boolean;
  requestedLanguage?: string;
}

// ========== PROGRESS TYPES ==========

export interface ProgressData {
  stepId: string;
  completed: boolean;
  progress?: number;
  timeSpent?: number;
  resourcesViewed?: number;
  lastAccessed?: Date;
}

export interface EngagementData {
  engagementScore: number;
  timeSpent: number;
  resourcesViewed: number;
  completed: boolean;
  autoCompleted: boolean;
  progressPercentage: number;
  lastAccessed?: Date;
}

export interface ProgressStats {
  completedSteps: number;
  totalSteps: number;
  completionRate: number;
  totalTimeSpent: number;
  resourcesViewed: number;
  currentStreak: number;
  longestStreak: number;
  averageEngagement: number;
  totalCodeSubmissions: number;
  totalProjectSubmissions: number;
  autoCompletedSteps: number;
}

export interface YearProgress {
  completed: number;
  total: number;
  progress: number;
}

// ========== SERVER ACTION RESPONSE TYPES ==========

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface RoadmapActionResponse extends ActionResponse {
  data?: RoadmapData | null;
}

export interface ProgressActionResponse extends ActionResponse {
  data?: {
    progress: ProgressData[];
  };
}

export interface YearsOverviewActionResponse extends ActionResponse {
  data?: YearOverview[];
}

export interface YearProgressActionResponse extends ActionResponse {
  data?: { [key: number]: YearProgress };
}

export interface AvailableYearsActionResponse extends ActionResponse {
  data?: AvailableYear[];
}

export interface AvailableLanguagesActionResponse extends ActionResponse {
  data?: string[];
}

// ========== HELPER TYPES ==========

export interface YearOverview {
  year: number;
  title: string;
  description: string;
  totalSteps: number;
  available: boolean;
  label: string;
  isFallback?: boolean;
}

export interface AvailableYear {
  year: number;
  available: boolean;
  label: string;
}

export interface YearDescription {
  title: string;
  description: string;
  focus: string;
  icon: string;
  prerequisites: string;
}

// ========== COMPONENT PROPS TYPES ==========

export interface StepCardProps {
  step: RoadmapStep;
  index: number;
  isCompleted: boolean;
  userId: string;
  engagementData: EngagementData;
  onTrackResourceView: (stepId: string, resource: Resource) => Promise<void>;
  onTrackVideoProgress: (stepId: string, timeSpent: number) => Promise<void>;
  onTrackQuizCompletion: (stepId: string, score: number) => Promise<void>;
  onManualComplete: (stepId: string) => Promise<void>;
}

export interface RoadmapViewProps {
  roadmap: RoadmapData;
  progress: ProgressData[];
  currentYear: number;
  userId: string;
  selectedLanguage: any;
  engagementData: { [key: string]: EngagementData };
  onTrackResourceView: (stepId: string, resource: Resource) => Promise<void>;
  onTrackVideoProgress: (stepId: string, timeSpent: number) => Promise<void>;
  onTrackQuizCompletion: (stepId: string, score: number) => Promise<void>;
  onManualComplete: (stepId: string) => Promise<void>;
  onRefreshProgress: () => Promise<void>;
}

export interface RoadmapClientProps {
  roadmap: RoadmapData;
  progress: ProgressData[];
  currentYear: number;
  userId: string;
  languages: any[];
  userLanguage: any;
  preferredLanguage: string;
  studentCurrentYear: number;
}

export interface ProgressSidebarProps {
  completedSteps: number;
  totalSteps: number;
  progressPercentage: number;
  currentYear: number;
}

export interface RoadmapHeaderProps {
  year: number;
  title: string;
  description: string;
  progressPercentage: number;
}

// ========== LANGUAGE TYPES ==========

export interface Language {
  id: string;
  name: string;
  icon?: string;
  description?: string;
  color?: string;
}

// ========== UTILITY TYPES ==========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ========== FILTER AND QUERY TYPES ==========

export interface RoadmapFilter {
  year?: number;
  language?: string;
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  status?: 'completed' | 'in-progress' | 'not-started';
}

export interface ProgressFilter {
  startDate?: Date;
  endDate?: Date;
  language?: string;
  year?: number;
}

// ========== TRACKING TYPES ==========

export interface ResourceViewData {
  userId: string;
  stepId: string;
  resourceUrl: string;
  resourceType: string;
  timestamp?: Date;
}

export interface TimeSpentData {
  userId: string;
  stepId: string;
  timeSpent: number; // in minutes
  activityType: 'video' | 'reading' | 'coding' | 'quiz';
  timestamp?: Date;
}

export interface QuizCompletionData {
  userId: string;
  stepId: string;
  score: number;
  totalQuestions: number;
  timeSpent: number;
  timestamp?: Date;
}

export interface StepCompletionData {
  userId: string;
  stepId: string;
  completed: boolean;
  autoCompleted: boolean;
  completionDate?: Date;
  timeSpent?: number;
}

// ========== ACHIEVEMENT TYPES ==========

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'streak' | 'completion' | 'speed' | 'mastery';
  criteria: {
    type: string;
    threshold: number;
    timeframe?: string;
  };
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
  streakHistory: {
    date: string;
    completed: boolean;
  }[];
}

// ========== STATISTICS TYPES ==========

export interface LearningStatistics {
  totalTimeSpent: number;
  averageDailyTime: number;
  resourcesCompleted: number;
  stepsCompleted: number;
  currentStreak: number;
  favoriteLanguage: string;
  mostProductiveDay: string;
  learningConsistency: number;
}

export interface WeeklyProgress {
  week: string;
  timeSpent: number;
  stepsCompleted: number;
  resourcesViewed: number;
  engagementScore: number;
}

// ========== NOTIFICATION TYPES ==========

export interface Notification {
  id: string;
  type: 'achievement' | 'reminder' | 'progress' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  actionUrl?: string;
  metadata?: any;
}

// ========== USER PREFERENCE TYPES ==========

export interface UserPreferences {
  language: string;
  currentYear: number;
  notifications: {
    achievement: boolean;
    reminder: boolean;
    progress: boolean;
    weeklyReport: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  dailyGoal: number; // in minutes
  autoTrackProgress: boolean;
  showCompletedSteps: boolean;
}