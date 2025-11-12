// models/CommunityPost.ts
import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICommunityReply {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userRole: 'student' | 'mentor';
  message: string;
  createdAt: Date;
}

export interface ICommunityPost extends Document {
  userId: Types.ObjectId;
  userName: string;
  userRole: 'student' | 'mentor';
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  replies: ICommunityReply[];
  upvotes: Types.ObjectId[];
  createdAt: Date;
}

export interface ICommunityPostLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userRole: 'student' | 'mentor';
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  replies: ICommunityReply[];
  upvotes: Types.ObjectId[];
  createdAt: Date;
  __v?: number;
}

const CommunityReplySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  userRole: { 
    type: String, 
    enum: ['student', 'mentor'], 
    required: true 
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const CommunityPostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  userRole: { 
    type: String, 
    enum: ['student', 'mentor'], 
    required: true 
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['query', 'discussion', 'announcement'], 
    default: 'query' 
  },
  replies: [CommunityReplySchema],
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export const CommunityPost: Model<ICommunityPost> = 
  mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);