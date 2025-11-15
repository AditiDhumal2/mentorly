export interface CommunityPost {
  _id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  title: string;
  content: string;
  category: 'general' | 'academic' | 'career' | 'technical' | 'announcement' | 'mentor-question';
  visibility: 'public' | 'students' | 'mentors' | 'admin-mentors' | 'announcement';
  replies: CommunityReply[];
  upvotes: string[];
  isDeleted: boolean;
  deletedBy?: string;
  deletedAt?: string;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommunityReply {
  _id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  message: string;
  createdAt: string;
  isDeleted: boolean;
  deletedBy?: string;
  deletedAt?: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: 'general' | 'academic' | 'career' | 'technical' | 'announcement' | 'mentor-question';
  visibility: 'public' | 'students' | 'mentors' | 'admin-mentors' | 'announcement';
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
}

export interface CreateReplyData {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  message: string;
}

export interface ReportData {
  postId: string;
  replyId?: string;
  reason: string;
  reportedBy: string;
  reportedByRole: 'student' | 'mentor' | 'moderator' | 'admin';
}

export interface ModeratorStats {
  totalPosts: number;
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  activeUsers: number;
}