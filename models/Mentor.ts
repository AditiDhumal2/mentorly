// models/Mentor.ts
import mongoose, { Document, Schema, Types } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IMentor extends Document {
  name: string;
  email: string;
  password: string;
  role: 'mentor';
  college?: string;
  
  // PROFILE PHOTO FIELD
  profilePhoto?: string;
  
  // Mentor-specific fields
  expertise: string[];
  experience?: number;
  qualification?: string;
  bio?: string;
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
  reviewedBy?: Types.ObjectId;
  
  // Profile completion tracking
  profileCompleted: boolean;
  
  // Login control
  canLogin: boolean;
  
  // Professional profiles
  profiles: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  
  // Mentor statistics
  stats: {
    responseTime: number;
    satisfactionRate: number;
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
    required: false,
    trim: true,
  },
  
  // PROFILE PHOTO FIELD
  profilePhoto: {
    type: String,
    required: false
  },
  
  // Mentor profile
  expertise: [String],
  experience: {
    type: Number,
    required: false,
    min: 0
  },
  qualification: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    required: false,
    maxlength: 1000
  },
  availability: {
    type: Boolean,
    default: false
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
  
  // Profile completion tracking
  profileCompleted: {
    type: Boolean,
    default: false
  },
  
  // Login control - allow login to complete profile
  canLogin: {
    type: Boolean,
    default: true
  },
  
  profiles: {
    linkedin: String,
    github: String,
    portfolio: String
  },
  
  stats: {
    responseTime: { type: Number, default: 24 },
    satisfactionRate: { type: Number, default: 0 },
    studentsHelped: { type: Number, default: 0 }
  },
  
  preferences: {
    sessionTypes: [String],
    maxSessionsPerWeek: { type: Number, default: 10 },
    availableDays: { 
      type: [String], 
      default: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
    },
    timeSlots: { 
      type: [String], 
      default: ['09:00-11:00', '14:00-16:00', '18:00-20:00'] 
    }
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

// Modified auto-set logic - only set availability when approved
mentorSchema.pre('save', function(next) {
  // Only auto-set availability when approved, don't touch canLogin
  if (this.isModified('approvalStatus') && this.approvalStatus === 'approved') {
    this.availability = true;
  }
  next();
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