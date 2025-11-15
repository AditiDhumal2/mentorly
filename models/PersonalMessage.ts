import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMessage extends Document {
  senderId: Types.ObjectId;
  senderRole: 'student' | 'mentor';
  senderName: string;
  receiverId: Types.ObjectId;
  receiverRole: 'student' | 'mentor';
  receiverName: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  conversationId: string; // Unique ID for the conversation between two users
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>({
  senderId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'senderRole'
  },
  senderRole: {
    type: String,
    required: true,
    enum: ['student', 'mentor']
  },
  senderName: {
    type: String,
    required: true
  },
  receiverId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverRole'
  },
  receiverRole: {
    type: String,
    required: true,
    enum: ['student', 'mentor']
  },
  receiverName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Generate conversationId (always sorted to ensure same conversation between two users)
messageSchema.pre('save', function(next) {
  const participants = [this.senderId.toString(), this.receiverId.toString()].sort();
  this.conversationId = `${participants[0]}_${participants[1]}`;
  next();
});

// Index for efficient querying
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ receiverId: 1, isRead: 1 });
messageSchema.index({ senderId: 1, receiverId: 1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);