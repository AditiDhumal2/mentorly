export interface CommunityPost {
  _id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  title: string;
  content: string;
  category: 'higher-education' | 'market-trends' | 'domains' | 'placements' | 'general' | 'academic' | 'career' | 'technical' | 'announcement' | 'mentor-question';
  visibility: 'public' | 'students' | 'mentors' | 'admin-mentors' | 'announcement';
  replies: CommunityReply[];
  upvotes: string[];
  isDeleted: boolean;
  deletedBy?: string;
  deletedAt?: string;
  reportCount: number;
  
  // New fields for edit tracking
  edited: boolean;
  editedAt?: string;
  editCount: number;
  
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
  category: 'higher-education' | 'market-trends' | 'domains' | 'placements' | 'general' | 'academic' | 'career' | 'technical' | 'announcement' | 'mentor-question';
  visibility: 'public' | 'students' | 'mentors' | 'admin-mentors' | 'announcement';
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
}

export interface UpdatePostData {
  title?: string;
  content?: string;
  category?: string;
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

export interface CategoryInfo {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  postCount: number;
  visibility: ('public' | 'students' | 'mentors' | 'admin-mentors')[];
}

export interface Moderator {
  _id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
  assignedCategories: string[];
  permissions: {
    canDeletePosts: boolean;
    canDeleteReplies: boolean;
    canManageReports: boolean;
    canViewAllContent: boolean;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserSearchResult {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor';
}

export interface ModeratorAssignmentData {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
  assignedCategories: string[];
}

export interface Report {
  _id: string;
  postId: string;
  replyId?: string;
  reportedBy: string;
  reportedByRole: 'student' | 'mentor' | 'moderator' | 'admin';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface CommunityStats {
  totalPosts: number;
  totalUsers: number;
  totalReplies: number;
  totalUpvotes: number;
  activeModerators: number;
  reportedContent: number;
}

export interface UserActivity {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  postCount: number;
  replyCount: number;
  upvoteCount: number;
  lastActivity: string;
}

export interface CategoryStats {
  category: string;
  postCount: number;
  replyCount: number;
  userCount: number;
  reportCount: number;
}

export interface ModerationAction {
  _id: string;
  moderatorId: string;
  moderatorName: string;
  actionType: 'post_deleted' | 'reply_deleted' | 'report_resolved' | 'user_warned';
  targetId: string;
  targetType: 'post' | 'reply' | 'user';
  reason: string;
  createdAt: string;
}

export interface ModeratorDashboardData {
  assignedCategories: string[];
  totalPosts: number;
  pendingReports: number;
  recentActions: ModerationAction[];
  categoryStats: CategoryStats[];
}

export interface PostPermissions {
  canEdit: boolean;
  canDelete: boolean;
  reason?: string;
  post?: CommunityPost;
}