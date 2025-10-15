// models/Students.ts
import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor';
  year: number;
  college: string;
  preferredLanguage: string;
  languages: {
    languageId: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced';
    startedAt: Date;
  }[];
  profiles: {
    linkedin?: string;
    github?: string;
    leetcode?: string;
    codechef?: string;
  };
  interests: string[];
  
  // Enhanced auto-progress tracking
  roadmapProgress: {
    year: number;
    stepId: mongoose.Types.ObjectId;
    completed: boolean;
    completedAt?: Date;
    startedAt?: Date;
    timeSpent: number; // in minutes
    lastActivity: Date;
    // Auto-completion metrics
    resourcesViewed: string[]; // URLs of viewed resources
    timeSpentOnStep: number; // Total time spent on this step
    engagementScore: number; // 0-100 based on activity
    autoCompleted: boolean; // Whether system auto-completed it
  }[];
  
  // Activity tracking for auto-progress
  activityLog: {
    action: 'started_step' | 'viewed_resource' | 'saved_resource' | 'logged_in' | 'time_spent' | 'code_submission' | 'project_submission';
    stepId?: mongoose.Types.ObjectId;
    resourceId?: mongoose.Types.ObjectId;
    timestamp: Date;
    metadata?: any;
    duration?: number; // Time spent in minutes
  }[];
  
  // Learning analytics
  learningStats: {
    totalTimeSpent: number;
    stepsCompleted: number;
    resourcesViewed: number;
    lastActive: Date;
    currentStreak: number;
    longestStreak: number;
    loginCount: number;
    // Auto-progress metrics
    averageEngagement: number;
    totalCodeSubmissions: number;
    totalProjectSubmissions: number;
  };
  
  brandingProgress: {
    taskId: mongoose.Types.ObjectId;
    completed: boolean;
    completedAt?: Date;
  }[];
  
  savedResources: {
    resourceId: mongoose.Types.ObjectId;
    savedAt: Date;
  }[];
  
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>({
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
    enum: ['student', 'mentor'],
    default: 'student',
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1,
    max: 4,
  },
  college: {
    type: String,
    required: [true, 'College is required'],
    trim: true,
  },
  preferredLanguage: {
    type: String,
    default: 'python'
  },
  languages: [{
    languageId: String,
    proficiency: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    startedAt: {
      type: Date,
      default: Date.now
    }
  }],
  profiles: {
    linkedin: String,
    github: String,
    leetcode: String,
    codechef: String,
  },
  interests: [String],
  
  // Enhanced auto-progress tracking
  roadmapProgress: [{
    year: Number,
    stepId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
    startedAt: Date,
    timeSpent: { 
      type: Number, 
      default: 0 
    },
    lastActivity: Date,
    resourcesViewed: [String], // Track which resources were viewed
    timeSpentOnStep: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    autoCompleted: { type: Boolean, default: false }
  }],
  
  // Enhanced activity logging
  activityLog: [{
    action: {
      type: String,
      enum: ['started_step', 'viewed_resource', 'saved_resource', 'logged_in', 'time_spent', 'code_submission', 'project_submission'],
      required: true,
    },
    stepId: {
      type: Schema.Types.ObjectId,
      ref: 'Roadmap',
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: Schema.Types.Mixed,
    duration: Number
  }],
  
  // Enhanced learning analytics
  learningStats: {
    totalTimeSpent: { type: Number, default: 0 },
    stepsCompleted: { type: Number, default: 0 },
    resourcesViewed: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    loginCount: { type: Number, default: 0 },
    averageEngagement: { type: Number, default: 0 },
    totalCodeSubmissions: { type: Number, default: 0 },
    totalProjectSubmissions: { type: Number, default: 0 }
  },
  
  brandingProgress: [{
    taskId: {
      type: Schema.Types.ObjectId,
      ref: 'BrandingChecklist',
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: Date,
  }],
  
  savedResources: [{
    resourceId: {
      type: Schema.Types.ObjectId,
      ref: 'Resource',
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
  }],
}, {
  timestamps: true,
});

// Enhanced password hashing with better error handling
studentSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    console.log('🔑 Password not modified, skipping hash');
    return next();
  }
  
  try {
    console.log('🔑 Hashing password...');
    console.log('🔑 Plain password before hash:', this.password);
    
    // Hash the password with cost factor 12
    this.password = await bcrypt.hash(this.password, 12);
    
    console.log('🔑 Password after hash:', this.password.substring(0, 20) + '...');
    console.log('✅ Password hashed successfully');
    next();
  } catch (error: any) {
    console.error('❌ Error hashing password:', error);
    next(error);
  }
});

// Enhanced password comparison with debugging
studentSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    console.log('🔑 Comparing passwords...');
    console.log('🔑 Candidate password:', candidatePassword.substring(0, 3) + '...');
    console.log('🔑 Stored hash:', this.password.substring(0, 20) + '...');
    
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('🔑 Password comparison result:', isMatch);
    
    return isMatch;
  } catch (error) {
    console.error('❌ Error comparing passwords:', error);
    return false;
  }
};

export const Student = mongoose.models.Student || mongoose.model<IStudent>('Student', studentSchema);