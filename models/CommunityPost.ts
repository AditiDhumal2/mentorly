import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ICommunityReply {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  message: string;
  createdAt: Date;
  isDeleted: boolean;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
}

export interface ICommunityPost extends Document {
  userId: Types.ObjectId;
  userName: string;
  userRole: 'student' | 'mentor' | 'moderator' | 'admin';
  title: string;
  content: string;
  category: 'higher-education' | 'market-trends' | 'domains' | 'placements' | 'general' | 'academic' | 'career' | 'technical' | 'announcement' | 'mentor-question';
  visibility: 'public' | 'students' | 'mentors' | 'admin-mentors' | 'announcement';
  replies: ICommunityReply[];
  upvotes: Types.ObjectId[];
  isDeleted: boolean;
  deletedBy?: Types.ObjectId;
  deletedAt?: Date;
  reportCount: number;
  
  targetedMentorId?: Types.ObjectId;
  targetedMentorName?: string;
  questionStatus: 'pending' | 'answered' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IReport extends Document {
  postId: Types.ObjectId;
  replyId?: Types.ObjectId;
  reportedBy: Types.ObjectId;
  reportedByRole: 'student' | 'mentor' | 'moderator' | 'admin';
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolvedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface IModerator extends Document {
  userId: Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const CommunityReplySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  userRole: { 
    type: String, 
    enum: ['student', 'mentor', 'moderator', 'admin'], 
    required: true 
  },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date }
});

const CommunityPostSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  userName: { type: String, required: true },
  userRole: { 
    type: String, 
    enum: ['student', 'mentor', 'moderator', 'admin'], 
    required: true 
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['higher-education', 'market-trends', 'domains', 'placements', 'general', 'academic', 'career', 'technical', 'announcement', 'mentor-question'], 
    default: 'general' 
  },
  visibility: {
    type: String,
    enum: ['public', 'students', 'mentors', 'admin-mentors', 'announcement'],
    default: 'public'
  },
  replies: [CommunityReplySchema],
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
  deletedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  deletedAt: { type: Date },
  reportCount: { type: Number, default: 0 },
  
  targetedMentorId: { type: Schema.Types.ObjectId, ref: 'Mentor' },
  targetedMentorName: { type: String },
  questionStatus: {
    type: String,
    enum: ['pending', 'answered', 'resolved'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [{ type: String }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ReportSchema = new Schema({
  postId: { type: Schema.Types.ObjectId, required: true, ref: 'CommunityPost' },
  replyId: { type: Schema.Types.ObjectId, ref: 'CommunityPost.replies' },
  reportedBy: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
  reportedByRole: {
    type: String,
    enum: ['student', 'mentor', 'moderator', 'admin'],
    required: true
  },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'resolved', 'dismissed'],
    default: 'pending'
  },
  resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const ModeratorSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, required: true, refPath: 'userModel' },
  userModel: {
    type: String,
    required: true,
    enum: ['Student', 'Mentor']
  },
  userName: { type: String, required: true },
  userRole: { 
    type: String, 
    enum: ['student', 'mentor'], 
    required: true 
  },
  assignedCategories: [{
    type: String,
    enum: ['higher-education', 'market-trends', 'domains', 'placements', 'general', 'academic', 'career', 'technical', 'announcement']
  }],
  permissions: {
    canDeletePosts: { type: Boolean, default: true },
    canDeleteReplies: { type: Boolean, default: true },
    canManageReports: { type: Boolean, default: true },
    canViewAllContent: { type: Boolean, default: true }
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CommunityPost: Model<ICommunityPost> = 
  mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);

export const Report: Model<IReport> = 
  mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);

export const Moderator: Model<IModerator> = 
  mongoose.models.Moderator || mongoose.model<IModerator>('Moderator', ModeratorSchema);