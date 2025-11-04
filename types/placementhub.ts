// types/placementhub.ts

export interface PlacementHubData {
  _id: string;
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  toolsAndPractice: {
    mockInterviewPortal: string;
    resumeTemplates: ResumeTemplate[];
    topCodingProblems: CodingProblem[];
    contestCalendar: Contest[];
  };
  interviewTips: InterviewTip[];
  updatedAt: Date;
}

export interface ResumeTemplate {
  title: string;
  url: string;
  type: 'pdf' | 'doc' | 'external';
  source: string;
  description: string;
}

export interface CodingProblem {
  title: string;
  platform: string;
  url: string;
}

export interface Contest {
  name: string;
  date: Date;
  platform: string;
}

export interface InterviewTip {
  title: string;
  description: string;
}

export interface PlacementFormData {
  mustHaveSkills: string[];
  goodToHaveSkills: string[];
  toolsAndPractice: {
    mockInterviewPortal: string;
    resumeTemplates: ResumeTemplate[];
    topCodingProblems: CodingProblem[];
    contestCalendar: Contest[];
  };
  interviewTips: InterviewTip[];
}