import mongoose, { Document, Schema } from 'mongoose';

export interface IMentorSession extends Document {
  studentId: mongoose.Types.ObjectId;
  mentorId: mongoose.Types.ObjectId;
  sessionType: 'higher-education' | 'career-guidance' | 'technical' | 'placement-prep' | 'study-abroad';
  title: string;
  description: string;
  status: 'requested' | 'accepted' | 'scheduled' | 'completed' | 'cancelled' | 'rejected';
  
  // Scheduling
  proposedDates: Date[];
  scheduledDate?: Date;
  duration: number;
  meetingLink?: string;
  
  // Communication
  studentQuestions: string[];
  mentorNotes?: string;
  preSessionMaterials?: string[];
  
  // Guidance plan
  mentorPlan: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
      resources: { title: string; url: string }[];
      deadline?: Date;
      completed: boolean;
      completedAt?: Date;
    }[];
  };
  
  // Feedback
  studentFeedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  
  mentorFeedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  
  // Timestamps
  requestedAt: Date;
  acceptedAt?: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  rejectedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const mentorSessionSchema = new Schema<IMentorSession>({
  studentId: {
    type: Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  mentorId: {
    type: Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true,
  },
  sessionType: {
    type: String,
    enum: ['higher-education', 'career-guidance', 'technical', 'placement-prep', 'study-abroad'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['requested', 'accepted', 'scheduled', 'completed', 'cancelled', 'rejected'],
    default: 'requested',
  },
  
  // Scheduling
  proposedDates: [Date],
  scheduledDate: Date,
  duration: {
    type: Number,
    default: 60
  },
  meetingLink: String,
  
  // Communication
  studentQuestions: [String],
  mentorNotes: String,
  preSessionMaterials: [String],
  
  // Guidance plan
  mentorPlan: {
    title: String,
    description: String,
    steps: [{
      title: String,
      description: String,
      resources: [{
        title: String,
        url: String
      }],
      deadline: Date,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }]
  },
  
  // Feedback
  studentFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  },
  
  mentorFeedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String,
    createdAt: { type: Date, default: Date.now }
  },
  
  // Status timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  scheduledAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  rejectedAt: Date
}, {
  timestamps: true,
});

// Indexes
mentorSessionSchema.index({ mentorId: 1, status: 1 });
mentorSessionSchema.index({ studentId: 1, status: 1 });
mentorSessionSchema.index({ scheduledDate: 1 });
mentorSessionSchema.index({ createdAt: -1 });

export const MentorSession = mongoose.models.MentorSession || mongoose.model<IMentorSession>('MentorSession', mentorSessionSchema);