export interface Mentor {
  _id: string;
  name: string;
  email: string;
  college: string;
  expertise: string[];
  experience: number;
  qualification: string;
  bio: string;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
  }>;
  profiles: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  hourlyRate: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  profileCompleted: boolean;
  availability: boolean;
  rating: number;
  totalSessions: number;
  studentsHelped: number;
  responseTime: number;
  satisfactionRate: number;
}

export interface MentorSessionRequest {
  studentId: string;
  mentorId: string;
  sessionType: 'higher-education' | 'career-guidance' | 'technical' | 'placement-prep' | 'study-abroad';
  title: string;
  description: string;
  proposedDates: Date[];
  status?: 'requested' | 'accepted' | 'scheduled' | 'completed' | 'cancelled' | 'rejected';
}

export interface MentorSearchParams {
  searchQuery?: string;
  filters: {
    expertise: string[];
    minExperience: number;
    maxExperience: number;
    minRating: number;
  };
  page?: number;
  limit?: number;
}

export interface SessionRequest {
  _id: string;
  mentor: {
    _id: string;
    name: string;
    email: string;
    college: string;
    expertise: string[];
  };
  sessionType: string;
  title: string;
  description: string;
  status: string;
  proposedDates: Date[];
  scheduledDate?: Date;
  requestedAt: Date;
  createdAt: Date;
}