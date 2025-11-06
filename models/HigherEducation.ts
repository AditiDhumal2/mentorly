// models/HigherEducation.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

const UniversityDetailSchema = new Schema({
  name: { type: String, required: true },
  ranking: { type: Number, required: true },
  globalRanking: { type: Number, required: true },
  website: { type: String, required: true },
  popularPrograms: [{ type: String }],
  admissionCriteria: {
    gpa: { type: Number, required: true },
    gre: { type: Number, required: true },
    ielts: { type: Number, required: true },
    toefl: { type: Number, required: true },
    workExperience: { type: Number },
    researchPublications: { type: Boolean, default: false }
  },
  averageSalary: {
    masters: { type: String, required: true },
    phd: { type: String, required: true }
  },
  tuitionFees: {
    masters: { type: String, required: true },
    phd: { type: String, required: true }
  },
  financialAid: {
    ta: { type: Boolean, default: false },
    ra: { type: Boolean, default: false },
    scholarships: { type: Boolean, default: false },
    fellowship: { type: Boolean, default: false }
  },
  applicationDeadlines: {
    fall: { type: String, required: true },
    spring: { type: String, required: true }
  }
});

const TA_RAGuideSchema = new Schema({
  eligibility: [{ type: String }],
  requirements: [{ type: String }],
  applicationProcess: [{ type: String }],
  tips: [{ type: String }],
  documentsRequired: [{ type: String }],
  averageStipend: { type: String, required: true }
});

const CountrySchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  flag: { type: String, required: true },
  topInstitutes: [UniversityDetailSchema],
  visaRequirements: [{ type: String }],
  costOfLiving: {
    monthly: { type: String, required: true },
    yearly: { type: String, required: true }
  },
  taRaGuide: TA_RAGuideSchema,
  popularity: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  }
});

const StudyResourceSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ['book', 'video', 'practice_test', 'online_course'],
    required: true
  }
});

const StudyWeekSchema = new Schema({
  week: { type: Number, required: true },
  topics: [{ type: String }],
  resources: [StudyResourceSchema],
  practiceTests: [{ type: String }]
});

const ExamPreparationSchema = new Schema({
  examType: {
    type: String,
    enum: ['gre', 'ielts', 'toefl', 'gmat'],
    required: true
  },
  studyPlan: [StudyWeekSchema],
  recommendedScore: {
    minimum: { type: Number, required: true },
    competitive: { type: Number, required: true },
    excellent: { type: Number, required: true }
  },
  testCenters: [{ type: String }],
  registrationLink: { type: String, required: true },
  resources: {
    officialWebsite: { type: String, required: true },
    practiceTests: [{ type: String }],
    preparationBooks: [{ type: String }],
    onlineCourses: [{ type: String }]
  }
});

const DocumentTemplateSchema = new Schema({
  title: { type: String, required: true },
  downloadUrl: { type: String, required: true },
  forUniversities: [{ type: String }],
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true }
});

const DocumentExampleSchema = new Schema({
  title: { type: String, required: true },
  field: { type: String, required: true },
  preview: { type: String, required: true },
  strength: [{ type: String }]
});

const DocumentSampleSchema = new Schema({
  type: {
    type: String,
    enum: ['successful', 'average', 'needs_improvement'],
    required: true
  },
  content: { type: String, required: true },
  feedback: { type: String, required: true },
  university: { type: String, required: true }
});

const ApplicationDocumentSchema = new Schema({
  type: {
    type: String,
    enum: ['sop', 'lor', 'cv', 'portfolio', 'transcripts'],
    required: true
  },
  title: { type: String, required: true },
  guidelines: [{ type: String }],
  templates: [DocumentTemplateSchema],
  examples: [DocumentExampleSchema],
  commonMistakes: [{ type: String }],
  samples: [DocumentSampleSchema]
});

const ExamRequirementSchema = new Schema({
  exam: { type: String, required: true },
  score: { type: Number, required: true }
});

const ApplicationRequirementsSchema = new Schema({
  documents: [{ type: String }],
  exams: [ExamRequirementSchema],
  applicationFee: { type: Number, required: true },
  recommendationLetters: { type: Number, default: 3 }
});

const UniversityApplicationSchema = new Schema({
  universityId: {
    type: Schema.Types.ObjectId,
    ref: 'HigherEducation',
    required: true
  },
  universityName: { type: String, required: true },
  status: {
    type: String,
    enum: ['researching', 'preparing', 'applied', 'admitted', 'rejected'],
    default: 'researching'
  },
  deadline: { type: Date, required: true },
  requirements: ApplicationRequirementsSchema,
  notes: { type: String },
  program: { type: String, required: true },
  applicationFee: { type: Number, default: 0 }
});

const StudentDocumentSchema = new Schema({
  type: { type: String, required: true },
  name: { type: String, required: true },
  status: {
    type: String,
    enum: ['not_started', 'draft', 'reviewing', 'completed'],
    default: 'not_started'
  },
  lastUpdated: { type: Date, default: Date.now },
  fileUrl: { type: String }
});

const TimelineItemSchema = new Schema({
  step: { type: String, required: true },
  deadline: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  important: { type: Boolean, default: false }
});

const GREScoresSchema = new Schema({
  quant: Number,
  verbal: Number,
  awa: Number,
  total: Number,
  testDate: Date
});

const IELTSScoresSchema = new Schema({
  overall: Number,
  listening: Number,
  reading: Number,
  writing: Number,
  speaking: Number,
  testDate: Date
});

const TOEFLScoresSchema = new Schema({
  total: Number,
  reading: Number,
  listening: Number,
  speaking: Number,
  writing: Number,
  testDate: Date
});

const GMATScoresSchema = new Schema({
  total: Number,
  quant: Number,
  verbal: Number,
  ir: Number,
  awa: Number,
  testDate: Date
});

const ExamScoresSchema = new Schema({
  gre: GREScoresSchema,
  ielts: IELTSScoresSchema,
  toefl: TOEFLScoresSchema,
  gmat: GMATScoresSchema
});

const HigherEducationProgressSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  currentStep: { type: Number, default: 1 },
  completedSteps: [{ type: Number }],
  examScores: ExamScoresSchema,
  applications: [UniversityApplicationSchema],
  documents: [StudentDocumentSchema],
  timeline: [TimelineItemSchema],
  profileStrength: { type: Number, default: 0 },
  targetUniversities: [{ type: String }]
});

const HigherEducationSchema = new Schema({
  countries: [CountrySchema],
  examPreparations: [ExamPreparationSchema],
  applicationDocuments: [ApplicationDocumentSchema],
  studentProgress: [HigherEducationProgressSchema]
}, {
  timestamps: true
});

export const HigherEducation = mongoose.models.HigherEducation || 
  mongoose.model('HigherEducation', HigherEducationSchema);