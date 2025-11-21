// models/Message.ts
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  senderName: string;
  senderRole: 'student' | 'mentor' | 'admin';
  receiverId: mongoose.Types.ObjectId;
  receiverName: string;
  receiverRole: 'student' | 'mentor' | 'admin';
  content: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'senderRole'
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    required: true,
    enum: ['student', 'mentor', 'admin']
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverRole'
  },
  receiverName: {
    type: String,
    required: true
  },
  receiverRole: {
    type: String,
    required: true,
    enum: ['student', 'mentor', 'admin']
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
MessageSchema.index({ senderId: 1, receiverId: 1 });
MessageSchema.index({ receiverId: 1, isRead: 1 });
MessageSchema.index({ createdAt: -1 });

export const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);