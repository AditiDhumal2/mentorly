import { Types } from 'mongoose';
import { ICommunityPost, ICommunityReply, ICommunityPostLean } from '@/models/CommunityPost';

// Use string IDs for client components
export interface CommunityPost {
  _id: string;
  userId: string;
  userName: string;
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
  message: string;
  createdAt: string;
}

export interface CreatePostData {
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  userId: string;
  userName: string;
}

export interface CreateReplyData {
  postId: string;
  userId: string;
  userName: string;
  message: string;
}