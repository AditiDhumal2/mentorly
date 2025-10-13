import { cookies } from 'next/headers';
import { connectDB } from './db';
import { User } from '../models/User';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  year: number;
  role: 'student' | 'mentor' | 'admin';
  college: string;
  preferredLanguage: string;
  profiles: {
    linkedin?: string;
    github?: string;
    leetcode?: string;
    codechef?: string;
  };
  interests: string[];
  roadmapProgress?: Array<{
    year: number;
    stepId: string;
    completed: boolean;
    completedAt?: Date;
    startedAt?: Date;
    timeSpent: number;
    lastActivity: Date;
    resourcesViewed: string[];
    timeSpentOnStep: number;
    engagementScore: number;
    autoCompleted: boolean;
  }>;
  learningStats?: {
    totalTimeSpent: number;
    stepsCompleted: number;
    resourcesViewed: number;
    lastActive: Date;
    currentStreak: number;
    longestStreak: number;
    loginCount: number;
    averageEngagement: number;
    totalCodeSubmissions: number;
    totalProjectSubmissions: number;
  };
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    await connectDB();
    
    // Get user from session/cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    // For testing, if no userId in cookies, return the first user
    if (!userId) {
      const user = await User.findOne()
        .select('name email year role college profiles interests preferredLanguage roadmapProgress learningStats')
        .lean();
      
      if (!user) {
        return null;
      }
      
      const userData = user as any;
      return {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        year: userData.year,
        role: userData.role,
        college: userData.college,
        preferredLanguage: userData.preferredLanguage || 'python',
        profiles: userData.profiles || {},
        interests: userData.interests || [],
        roadmapProgress: userData.roadmapProgress || [],
        learningStats: userData.learningStats || {
          totalTimeSpent: 0,
          stepsCompleted: 0,
          resourcesViewed: 0,
          lastActive: new Date(),
          currentStreak: 0,
          longestStreak: 0,
          loginCount: 0,
          averageEngagement: 0,
          totalCodeSubmissions: 0,
          totalProjectSubmissions: 0
        }
      };
    }
    
    const user = await User.findById(userId)
      .select('name email year role college profiles interests preferredLanguage roadmapProgress learningStats')
      .lean();
    
    if (!user) {
      return null;
    }
    
    const userData = user as any;
    return {
      id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      year: userData.year,
      role: userData.role,
      college: userData.college,
      preferredLanguage: userData.preferredLanguage || 'python',
      profiles: userData.profiles || {},
      interests: userData.interests || [],
      roadmapProgress: userData.roadmapProgress || [],
      learningStats: userData.learningStats || {
        totalTimeSpent: 0,
        stepsCompleted: 0,
        resourcesViewed: 0,
        lastActive: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        loginCount: 0,
        averageEngagement: 0,
        totalCodeSubmissions: 0,
        totalProjectSubmissions: 0
      }
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Helper function to get user with full data for auto-progress actions
export async function getCurrentUserWithProgress(userId: string): Promise<any> {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('+roadmapProgress +learningStats +activityLog preferredLanguage')
      .lean();
    
    if (!user) {
      return null;
    }
    
    // Ensure all required fields have default values
    const userData = user as any;
    return {
      ...userData,
      preferredLanguage: userData.preferredLanguage || 'python',
      roadmapProgress: userData.roadmapProgress || [],
      learningStats: userData.learningStats || {
        totalTimeSpent: 0,
        stepsCompleted: 0,
        resourcesViewed: 0,
        lastActive: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        loginCount: 0,
        averageEngagement: 0,
        totalCodeSubmissions: 0,
        totalProjectSubmissions: 0
      },
      activityLog: userData.activityLog || []
    };
  } catch (error) {
    console.error('Error getting user with progress:', error);
    return null;
  }
}

// Function to update user's last active time
export async function updateUserLastActive(userId: string): Promise<void> {
  try {
    await connectDB();
    
    await User.findByIdAndUpdate(userId, {
      $set: {
        'learningStats.lastActive': new Date(),
        'learningStats.loginCount': { $inc: 1 }
      }
    });
  } catch (error) {
    console.error('Error updating user last active:', error);
  }
}

// Function to ensure user has required fields initialized
export async function initializeUserData(userId: string): Promise<void> {
  try {
    await connectDB();
    
    const user = await User.findById(userId);
    if (!user) return;

    const userDoc = user as any;
    
    // Initialize preferredLanguage if it doesn't exist
    if (!userDoc.preferredLanguage) {
      userDoc.preferredLanguage = 'python';
    }
    
    // Initialize languages if it doesn't exist
    if (!userDoc.languages) {
      userDoc.languages = [];
    }
    
    // Initialize roadmapProgress if it doesn't exist
    if (!userDoc.roadmapProgress) {
      userDoc.roadmapProgress = [];
    }
    
    // Initialize learningStats with default values if missing
    if (!userDoc.learningStats) {
      userDoc.learningStats = {
        totalTimeSpent: 0,
        stepsCompleted: 0,
        resourcesViewed: 0,
        lastActive: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        loginCount: 0,
        averageEngagement: 0,
        totalCodeSubmissions: 0,
        totalProjectSubmissions: 0
      };
    }
    
    // Initialize activityLog if it doesn't exist
    if (!userDoc.activityLog) {
      userDoc.activityLog = [];
    }
    
    await userDoc.save();
  } catch (error) {
    console.error('Error initializing user data:', error);
  }
}