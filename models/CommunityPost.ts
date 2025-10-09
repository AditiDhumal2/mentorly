import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityPost extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: 'query' | 'discussion' | 'announcement';
  replies: {
    userId: mongoose.Types.ObjectId;
    message: string;
    createdAt: Date;
  }[];
  upvotes: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const communityPostSchema = new Schema<ICommunityPost>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    enum: ['query', 'discussion', 'announcement'],
    required: true,
  },
  replies: [{
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  upvotes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.CommunityPost || mongoose.model<ICommunityPost>('CommunityPost', communityPostSchema);