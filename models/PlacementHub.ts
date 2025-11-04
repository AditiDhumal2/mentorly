// models/PlacementHub.ts

import mongoose, { Document, Schema } from 'mongoose';

export interface IPlacementHub extends Document {
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  toolsAndPractice: {
    mockInterviewPortal: string;
    resumeTemplates: Array<{
      title: string;
      url: string;
      type: 'pdf' | 'doc' | 'external';
      source: string;
      description: string;
    }>;
    topCodingProblems: Array<{
      title: string;
      platform: string;
      url: string;
    }>;
    contestCalendar: Array<{
      name: string;
      date: Date;
      platform: string;
    }>;
  };
  interviewTips: Array<{
    title: string;
    description: string;
  }>;
  updatedAt: Date;
}

const ResumeTemplateSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  type: { type: String, enum: ['pdf', 'doc', 'external'], required: true },
  source: { type: String, required: true },
  description: { type: String, required: true }
});

const CodingProblemSchema = new Schema({
  title: { type: String, required: true },
  platform: { type: String, required: true },
  url: { type: String, required: true }
});

const ContestSchema = new Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  platform: { type: String, required: true }
});

const InterviewTipSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const ToolsAndPracticeSchema = new Schema({
  mockInterviewPortal: { type: String, required: true },
  resumeTemplates: [ResumeTemplateSchema],
  topCodingProblems: [CodingProblemSchema],
  contestCalendar: [ContestSchema]
});

const PlacementHubSchema: Schema = new Schema({
  mustHaveSkills: [{ type: String, required: true }],
  goodToHaveSkills: [{ type: String, required: true }],
  toolsAndPractice: ToolsAndPracticeSchema,
  interviewTips: [InterviewTipSchema],
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.PlacementHub || mongoose.model<IPlacementHub>('PlacementHub', PlacementHubSchema);