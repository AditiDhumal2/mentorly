// models/Mentor.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMentor extends Document {
  name: string;
  email: string;
  password: string;
  role: 'mentor';
  college: string;
  
  // Mentor-specific fields
  expertise: string[];
  experience: number;
  qualification: string;
  bio: string;
  availability: boolean;
  rating: number;
  totalSessions: number;
  hourlyRate?: number;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  
  // Approval system
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId; // admin who reviewed
  
  // Professional profiles
  profiles: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  
  // Mentor statistics
  stats: {
    responseTime: number; // average response time in hours
    satisfactionRate: number; // percentage
    studentsHelped: number;
  };
  
  // Session preferences
  preferences: {
    sessionTypes: string[];
    maxSessionsPerWeek: number;
    availableDays: string[];
    timeSlots: string[];
  };
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const mentorSchema = new Schema<IMentor>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['mentor'],
    default: 'mentor',
  },
  college: {
    type: String,
    required: [true, 'College/University is required'],
    trim: true,
  },
  
  // Mentor profile
  expertise: [String],
  experience: {
    type: Number,
    required: [true, 'Experience is required'],
    min: 0
  },
  qualification: {
    type: String,
    required: [true, 'Qualification is required']
  },
  bio: {
    type: String,
    required: [true, 'Bio is required'],
    maxlength: 1000
  },
  availability: {
    type: Boolean,
    default: false // Default to false until approved
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalSessions: {
    type: Number,
    default: 0
  },
  hourlyRate: Number,
  skills: [String],
  education: [{
    degree: String,
    institution: String,
    year: Number
  }],
  
  // Approval system
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: String,
  submittedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: Date,
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  
  profiles: {
    linkedin: String,
    github: String,
    portfolio: String
  },
  
  stats: {
    responseTime: { type: Number, default: 24 }, // hours
    satisfactionRate: { type: Number, default: 0 }, // percentage
    studentsHelped: { type: Number, default: 0 }
  },
  
  preferences: {
    sessionTypes: [String],
    maxSessionsPerWeek: { type: Number, default: 10 },
    availableDays: [String],
    timeSlots: [String]
  }
}, {
  timestamps: true,
});

// Password hashing
mentorSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Password comparison
mentorSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export const Mentor = mongoose.models.Mentor || mongoose.model<IMentor>('Mentor', mentorSchema);