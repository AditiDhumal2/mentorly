export interface MentorSession {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    email: string;
    year: string;
    college?: string;
    interests?: string[];
  };
  mentorId: string;
  sessionType: 'higher-education' | 'career-guidance' | 'technical' | 'placement-prep' | 'study-abroad';
  title: string;
  description: string;
  status: 'requested' | 'accepted' | 'scheduled' | 'completed' | 'cancelled' | 'rejected';
  proposedDates: string[];
  scheduledDate?: string;
  duration: number;
  meetingLink?: string;
  studentQuestions: string[];
  mentorNotes?: string;
  preSessionMaterials?: string[];
  mentorPlan?: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
      resources: { title: string; url: string }[];
      deadline?: string;
      completed: boolean;
      completedAt?: string;
    }[];
  };
  studentFeedback?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  mentorFeedback?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
  requestedAt: string;
  acceptedAt?: string;
  scheduledAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionActionRequest {
  sessionId: string;
  action: 'accept' | 'reject' | 'schedule' | 'complete' | 'cancel';
  scheduledDate?: string;
  meetingLink?: string;
  mentorNotes?: string;
  mentorPlan?: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
      resources: { title: string; url: string }[];
      deadline?: string;
    }[];
  };
}