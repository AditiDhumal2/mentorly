import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor' | 'admin';
  year: number;
  college: string;
  profiles: {
    linkedin?: string;
    github?: string;
    leetcode?: string;
    codechef?: string;
  };
  interests: string[];
  roadmapProgress: {
    year: number;
    stepId: mongoose.Types.ObjectId;
    completed: boolean;
    completedAt?: Date;
  }[];
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

const userSchema = new Schema<IUser>({
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
    enum: ['student', 'mentor', 'admin'],
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
  profiles: {
    linkedin: String,
    github: String,
    leetcode: String,
    codechef: String,
  },
  interests: [String],
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
  }],
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);