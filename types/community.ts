// types/community.ts
export interface CommunityPost {
  _id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  replies: CommunityReply[];
  upvotes: string[];
  createdAt: string;
  __v?: number;
}

export interface CommunityReply {
  _id: string;
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
  message: string;
  createdAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
}

export interface CreateReplyData {
  userId: string;
  userName: string;
  userRole: 'student' | 'mentor';
  message: string;
}