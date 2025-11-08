// Higher Education Types

// ===== COUNTRY RELATED TYPES =====
export interface Country {
  _id: string;
  name: string;
  code: string;
  flag?: string;
  topInstitutes: UniversityDetail[];
  popularUniversities?: UniversityDetail[];
  visaRequirements: string[];
  costOfLiving: {
    monthly: string;
    yearly: string;
  };
  taRaGuide?: TA_RAGuide;
  popularity?: 'high' | 'medium' | 'low';
  description?: string;
  applicationProcess?: string;
}

export interface UniversityDetail {
  _id: string;
  name: string;
  ranking: number;
  globalRanking?: number;
  website: string;
  popularPrograms: string[];
  admissionCriteria: {
    gpa: number;
    gre: number;
    ielts: number;
    toefl: number;
    workExperience?: number;
    researchPublications?: boolean;
  };
  averageSalary: {
    masters: string;
    phd: string;
  };
  tuitionFees?: {
    masters: string;
    phd: string;
  };
  financialAid?: {
    ta: boolean;
    ra: boolean;
    scholarships: boolean;
    fellowship: boolean;
  };
  applicationDeadlines?: {
    fall: string;
    spring: string;
  };
}

export interface TA_RAGuide {
  eligibility: string[];
  requirements: string[];
  applicationProcess: string[];
  tips: string[];
  documentsRequired: string[];
  averageStipend: string;
}

// ===== EXAM RELATED TYPES =====
export interface ExamPreparation {
  _id: string;
  examType: 'gre' | 'ielts' | 'toefl' | 'gmat' | 'new-exam';
  studyPlan: StudyWeek[];
  recommendedScore: ScoreRange;
  testCenters: string[];
  registrationLink: string;
  resources?: {
    officialWebsite: string;
    practiceTests: string[];
    preparationBooks: string[];
    onlineCourses: string[];
  };
  title?: string;
  description?: string;
}

export interface StudyWeek {
  week: number;
  topics: string[];
  resources: StudyResource[];
  practiceTests?: string[];
}

export interface StudyResource {
  title: string;
  url: string;
  type: 'book' | 'video' | 'practice_test' | 'online_course';
}

export interface ScoreRange {
  minimum: number;
  competitive: number;
  excellent?: number;
}

// ===== DOCUMENT RELATED TYPES =====
export interface ApplicationDocument {
  _id: string;
  type: 'sop' | 'lor' | 'cv' | 'portfolio' | 'transcripts' | 'new-document';
  title: string;
  guidelines: string[];
  templates: DocumentTemplate[];
  examples: DocumentExample[];
  commonMistakes: string[];
  samples?: DocumentSample[];
}

export interface DocumentTemplate {
  title: string;
  downloadUrl: string;
  forUniversities: string[];
  fileType?: string;
  fileSize?: string;
}

export interface DocumentExample {
  title: string;
  field: string;
  preview: string;
  strength?: string[];
}

export interface DocumentSample {
  type: 'successful' | 'average' | 'needs_improvement';
  content: string;
  feedback: string;
  university: string;
}

// ===== STUDENT PROGRESS RELATED TYPES =====
export interface StudentProgress {
  _id: string;
  userId: string;
  currentStep: number;
  completedSteps: number[];
  examScores?: ExamScores;
  applications: UniversityApplication[];
  documents: StudentDocument[];
  timeline: TimelineItem[];
  profileStrength?: number;
  targetUniversities?: string[];
  studentInfo?: {
    name?: string;
    email?: string;
    college?: string;
    year?: string;
  };
}

export interface ExamScores {
  gre?: GREScores;
  ielts?: IELTSScores;
  toefl?: TOEFLScores;
  gmat?: GMATScores;
}

export interface GREScores {
  quant: number;
  verbal: number;
  awa: number;
  total: number;
  testDate: Date | string;
}

export interface IELTSScores {
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  testDate: Date | string;
}

export interface TOEFLScores {
  total: number;
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  testDate: Date | string;
}

export interface GMATScores {
  total: number;
  quant: number;
  verbal: number;
  ir: number;
  awa: number;
  testDate: Date | string;
}

export interface UniversityApplication {
  _id: string;
  universityId: string;
  universityName: string;
  status: 'researching' | 'preparing' | 'applied' | 'admitted' | 'rejected';
  deadline: Date | string;
  requirements: ApplicationRequirements;
  notes: string;
  program: string;
  applicationFee: number;
}

export interface ApplicationRequirements {
  documents: string[];
  exams: ExamRequirement[];
  applicationFee: number;
  recommendationLetters: number;
}

export interface ExamRequirement {
  exam: string;
  score: number;
}

export interface StudentDocument {
  type: string;
  name: string;
  status: 'not_started' | 'draft' | 'reviewing' | 'completed';
  lastUpdated: Date | string;
  fileUrl?: string;
  _id?: string;
}

export interface TimelineItem {
  step: string;
  deadline: Date | string;
  completed: boolean;
  important?: boolean;
  _id?: string;
}

// ===== TA/RA MANAGEMENT TYPES =====
export interface TA_RAGuideItem {
  _id: string;
  countryId: string;
  countryName: string;
  eligibility: string[];
  requirements: string[];
  applicationProcess: string[];
  tips: string[];
  documentsRequired: string[];
  averageStipend: string;
  benefits: string[];
  timeline: string[];
  contactInfo?: {
    email: string;
    website: string;
    deadline: string;
  };
}

// ===== MAIN DATA STRUCTURE TYPES =====
export interface HigherEducationData {
  countries: Country[];
  examPreparations: ExamPreparation[];
  applicationDocuments: ApplicationDocument[];
  studentProgress: StudentProgress[];
  taRaGuides?: TA_RAGuideItem[];
}

// ===== COMPONENT PROP TYPES =====
export interface CountriesManagerProps {
  countries: Country[];
}

export interface ExamsManagerProps {
  exams: ExamPreparation[];
}

export interface DocumentsManagerProps {
  documents: ApplicationDocument[];
}

export interface TA_RAManagerProps {
  taRaGuides: TA_RAGuideItem[];
}

export interface DataManagementTabsProps {
  data?: HigherEducationData & {
    taRaGuides?: TA_RAGuideItem[];
  };
  countries?: Country[];
  exams?: ExamPreparation[];
  documents?: ApplicationDocument[];
  taRaGuides?: TA_RAGuideItem[];
}

// ===== ADMIN COMPONENT PROP TYPES =====
export interface AdminStatsProps {
  higherEdData: HigherEducationData;
  studentProgress: StudentProgress[];
}

export interface StudentProgressOverviewProps {
  progressData: StudentProgress[];
}

// ===== FORM AND MODAL TYPES =====
export interface CountryFormData {
  name: string;
  code: string;
  flag: string;
  description?: string;
  topInstitutes: UniversityDetail[];
  visaRequirements: string[];
  costOfLiving: {
    monthly: string;
    yearly: string;
  };
  popularity: 'high' | 'medium' | 'low';
}

export interface ExamFormData {
  examType: 'gre' | 'ielts' | 'toefl' | 'gmat';
  title: string;
  description?: string;
  recommendedScore: ScoreRange;
  registrationLink: string;
  testCenters: string[];
  studyPlan: StudyWeek[];
}

export interface DocumentFormData {
  type: 'sop' | 'lor' | 'cv' | 'portfolio' | 'transcripts';
  title: string;
  guidelines: string[];
  templates: DocumentTemplate[];
  examples: DocumentExample[];
  commonMistakes: string[];
}

export interface TA_RAFormData {
  countryName: string;
  eligibility: string[];
  requirements: string[];
  applicationProcess: string[];
  tips: string[];
  documentsRequired: string[];
  averageStipend: string;
  benefits: string[];
  timeline: string[];
}

// ===== API RESPONSE TYPES =====
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UpdateResponse {
  success: boolean;
  error?: string;
}

// ===== FILTER AND SEARCH TYPES =====
export interface CountryFilter {
  popularity?: 'high' | 'medium' | 'low';
  hasTA_RA?: boolean;
  searchTerm?: string;
}

export interface ExamFilter {
  examType?: ('gre' | 'ielts' | 'toefl' | 'gmat')[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  searchTerm?: string;
}

export interface DocumentFilter {
  type?: ('sop' | 'lor' | 'cv' | 'portfolio' | 'transcripts')[];
  searchTerm?: string;
}

// ===== STATISTICS TYPES =====
export interface AdminStatistics {
  totalCountries: number;
  totalExams: number;
  totalDocuments: number;
  totalTARAGuides: number;
  totalStudents: number;
  recentActivity: {
    type: 'country_added' | 'exam_updated' | 'document_created' | 'student_progress';
    description: string;
    timestamp: Date | string;
  }[];
}

export interface StudentProgressStats {
  totalStudents: number;
  byStatus: {
    researching: number;
    preparing: number;
    applied: number;
    admitted: number;
    rejected: number;
  };
  averageProfileStrength: number;
  topTargetUniversities: string[];
}

// ===== DEFAULT VALUES =====
export const DEFAULT_COUNTRY: Partial<Country> = {
  name: '',
  code: '',
  flag: '🏳️',
  topInstitutes: [],
  visaRequirements: [],
  costOfLiving: {
    monthly: '$0 - $0',
    yearly: '$0 - $0'
  },
  popularity: 'medium'
};

export const DEFAULT_EXAM: Partial<ExamPreparation> = {
  examType: 'gre',
  studyPlan: [],
  recommendedScore: {
    minimum: 0,
    competitive: 0,
    excellent: 0
  },
  testCenters: [],
  registrationLink: '',
  resources: {
    officialWebsite: '',
    practiceTests: [],
    preparationBooks: [],
    onlineCourses: []
  }
};

export const DEFAULT_DOCUMENT: Partial<ApplicationDocument> = {
  type: 'sop',
  title: '',
  guidelines: [],
  templates: [],
  examples: [],
  commonMistakes: [],
  samples: []
};

export const DEFAULT_TA_RA_GUIDE: Partial<TA_RAGuideItem> = {
  countryName: '',
  eligibility: [],
  requirements: [],
  applicationProcess: [],
  tips: [],
  documentsRequired: [],
  averageStipend: '',
  benefits: [],
  timeline: []
};

// ===== UTILITY TYPES =====
export type EntityType = 'country' | 'exam' | 'document' | 'ta_ra_guide' | 'student_progress';

export interface EntityOperation {
  type: 'create' | 'update' | 'delete';
  entity: EntityType;
  id?: string;
  data?: any;
  timestamp: Date | string;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  succeeded: number;
  failed: number;
  errors: string[];
}

// ===== VALIDATION TYPES =====
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CountryValidation extends ValidationResult {
  validUniversities: number;
  validVisaRequirements: number;
}

export interface ExamValidation extends ValidationResult {
  validStudyWeeks: number;
  validResources: number;
}

// ===== IMPORT/EXPORT TYPES =====
export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
}

export interface ExportOptions {
  includeCountries: boolean;
  includeExams: boolean;
  includeDocuments: boolean;
  includeTARAGuides: boolean;
  includeStudentProgress: boolean;
  format: 'json' | 'csv';
}

// Type guards and utility functions
export const isCountry = (obj: any): obj is Country => {
  return obj && typeof obj.name === 'string' && typeof obj.code === 'string';
};

export const isExamPreparation = (obj: any): obj is ExamPreparation => {
  return obj && typeof obj.examType === 'string' && Array.isArray(obj.studyPlan);
};

export const isApplicationDocument = (obj: any): obj is ApplicationDocument => {
  return obj && typeof obj.type === 'string' && typeof obj.title === 'string';
};

export const isStudentProgress = (obj: any): obj is StudentProgress => {
  return obj && typeof obj.userId === 'string' && typeof obj.currentStep === 'number';
};

export const isTA_RAGuideItem = (obj: any): obj is TA_RAGuideItem => {
  return obj && typeof obj.countryName === 'string' && Array.isArray(obj.eligibility);
};