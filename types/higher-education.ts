// types/higher-education.ts
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

export interface ExamPreparation {
  _id: string;
  examType: 'gre' | 'ielts' | 'toefl' | 'gmat';
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

export interface ApplicationDocument {
  _id: string;
  type: 'sop' | 'lor' | 'cv' | 'portfolio' | 'transcripts';
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
  testDate: Date;
}

export interface IELTSScores {
  overall: number;
  listening: number;
  reading: number;
  writing: number;
  speaking: number;
  testDate: Date;
}

export interface TOEFLScores {
  total: number;
  reading: number;
  listening: number;
  speaking: number;
  writing: number;
  testDate: Date;
}

export interface GMATScores {
  total: number;
  quant: number;
  verbal: number;
  ir: number;
  awa: number;
  testDate: Date;
}

export interface UniversityApplication {
  _id: string;
  universityId: string;
  universityName: string;
  status: 'researching' | 'preparing' | 'applied' | 'admitted' | 'rejected';
  deadline: Date;
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
  lastUpdated: Date;
  fileUrl?: string;
  _id?: string;
}

export interface TimelineItem {
  step: string;
  deadline: Date;
  completed: boolean;
  important?: boolean;
  _id?: string;
}