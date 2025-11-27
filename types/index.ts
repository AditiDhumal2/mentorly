// types/index.ts
export interface Mentor {
  id: string;
  _id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  approvalStatus: string;
  expertise: string[];
  college: string;
  experience: number;
  rating: number;
  totalSessions: number;
  profilePhoto?: string;
  stats?: {
    studentsHelped: number;
    responseTime: number;
    satisfactionRate: number;
  };
  memberSince?: string;
  bio?: string;
  skills?: string[];
  qualification?: string;
  availability?: boolean;
  education?: Array<{
    _id: string;
    degree: string;
    institution: string;
    year: number;
  }>;
  profiles?: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  preferences?: any;
}

export interface DashboardStats {
  upcomingSessions: number;
  completedSessions: number;
  studentsHelped: number;
  rating: number;
  pendingRequests: number;
  totalEarnings: number;
  responseTime?: number;
  satisfactionRate?: number;
}

export interface Session {
  id: string;
  _id: string;
  title: string;
  student: {
    id: string;
    name: string;
    email: string;
  };
  date: string;
  time: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'pending';
  duration: number;
  meetingLink?: string;
}

export interface Activity {
  id: string;
  _id: string;
  type: 'session' | 'request' | 'message' | 'review' | 'payment' | 'other';
  title: string;
  student: string;
  time: string;
  timestamp: string;
  status: string;
  icon: string;
  description?: string;
}