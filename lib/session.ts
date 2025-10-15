// lib/session.ts
import { cookies } from 'next/headers';
import { connectDB } from './db';
import { Student } from '../models/Students';
import { Admin } from '../models/Admins';

// Define proper types for our database documents
interface StudentDocument {
  _id: any;
  name: string;
  email: string;
  year: number;
  role: string;
  college: string;
  profiles?: any;
  interests?: string[];
  preferredLanguage?: string;
  roadmapProgress?: any[];
  learningStats?: any;
}

interface AdminDocument {
  _id: any;
  name: string;
  email: string;
  role: string;
  permissions?: any;
}

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
    // Get user from session/cookie - using the new cookie format
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get('user-data')?.value;
    
    console.log('🔍 getCurrentUser - Checking user-data cookie:', !!userDataCookie);

    if (!userDataCookie) {
      console.log('❌ getCurrentUser - No user-data cookie found');
      return null;
    }

    let userData;
    try {
      userData = JSON.parse(userDataCookie);
      console.log('🔍 getCurrentUser - Parsed user data from cookie:', {
        id: userData.id || userData._id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    } catch (parseError) {
      console.error('❌ getCurrentUser - Error parsing user-data cookie:', parseError);
      return null;
    }

    const userId = userData.id || userData._id;
    const userEmail = userData.email;
    
    if (!userId && !userEmail) {
      console.log('❌ getCurrentUser - No user ID or email found in cookie data');
      return null;
    }

    await connectDB();

    // If we have a user ID, try to find by ID first (more efficient)
    if (userId) {
      console.log('🔍 getCurrentUser - Searching by user ID:', userId);

      // Check if user is admin first
      if (userData.role === 'admin') {
        console.log('🔍 getCurrentUser - Checking Admin collection by ID');
        const admin = await Admin.findById(userId)
          .select('name email role permissions')
          .lean() as AdminDocument | null;

        if (admin) {
          console.log('✅ getCurrentUser - Admin user found by ID:', admin.name);
          return {
            id: admin._id.toString(),
            name: admin.name,
            email: admin.email,
            role: 'admin',
            year: 0,
            college: 'System Administrator',
            preferredLanguage: 'python',
            profiles: {},
            interests: [],
            roadmapProgress: [],
            learningStats: {
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
      }

      // If not admin or admin not found, check Student collection
      console.log('🔍 getCurrentUser - Checking Student collection by ID:', userId);
      const student = await Student.findById(userId)
        .select('name email year role college profiles interests preferredLanguage roadmapProgress learningStats')
        .lean() as StudentDocument | null;

      if (student) {
        console.log('✅ getCurrentUser - Student found by ID:', student.name);
        
        const normalizedRole = (student.role?.toLowerCase() as 'student' | 'mentor' | 'admin') || 'student';
        
        return {
          id: student._id.toString(),
          name: student.name,
          email: student.email,
          year: student.year,
          role: normalizedRole,
          college: student.college,
          preferredLanguage: student.preferredLanguage || 'python',
          profiles: student.profiles || {},
          interests: student.interests || [],
          roadmapProgress: student.roadmapProgress || [],
          learningStats: student.learningStats || {
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
    }

    // If user not found by ID or no ID, try by email
    if (userEmail) {
      console.log('🔍 getCurrentUser - User not found by ID, trying by email:', userEmail);

      // Check Admin collection by email
      const adminByEmail = await Admin.findOne({ email: userEmail.toLowerCase(), isActive: true })
        .select('name email role permissions')
        .lean() as AdminDocument | null;

      if (adminByEmail) {
        console.log('✅ getCurrentUser - Admin user found by email:', adminByEmail.name);
        return {
          id: adminByEmail._id.toString(),
          name: adminByEmail.name,
          email: adminByEmail.email,
          role: 'admin',
          year: 0,
          college: 'System Administrator',
          preferredLanguage: 'python',
          profiles: {},
          interests: [],
          roadmapProgress: [],
          learningStats: {
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

      // Check Student collection by email
      const studentByEmail = await Student.findOne({ email: userEmail.toLowerCase() })
        .select('name email year role college profiles interests preferredLanguage roadmapProgress learningStats')
        .lean() as StudentDocument | null;

      if (studentByEmail) {
        console.log('✅ getCurrentUser - Student found by email:', studentByEmail.name);
        
        const normalizedRole = (studentByEmail.role?.toLowerCase() as 'student' | 'mentor' | 'admin') || 'student';
        
        return {
          id: studentByEmail._id.toString(),
          name: studentByEmail.name,
          email: studentByEmail.email,
          year: studentByEmail.year,
          role: normalizedRole,
          college: studentByEmail.college,
          preferredLanguage: studentByEmail.preferredLanguage || 'python',
          profiles: studentByEmail.profiles || {},
          interests: studentByEmail.interests || [],
          roadmapProgress: studentByEmail.roadmapProgress || [],
          learningStats: studentByEmail.learningStats || {
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
    }

    console.log('❌ getCurrentUser - No user found in database for ID:', userId, 'or email:', userEmail);
    
    // Debug: Let's check what users actually exist
    const allStudents = await Student.find({}).select('_id name email role').limit(5);
    const allAdmins = await Admin.find({}).select('_id name email role').limit(5);
    
    console.log('🔍 getCurrentUser - Available students:', allStudents.map(s => ({ 
      id: s._id.toString(), 
      email: s.email, 
      name: s.name,
      role: s.role 
    })));
    console.log('🔍 getCurrentUser - Available admins:', allAdmins.map(a => ({ 
      id: a._id.toString(), 
      email: a.email, 
      name: a.name,
      role: a.role 
    })));
    
    return null;
  } catch (error) {
    console.error('❌ getCurrentUser - Error getting current user:', error);
    return null;
  }
}

// Helper function to get user with full data for auto-progress actions
export async function getCurrentUserWithProgress(userId: string): Promise<any> {
  try {
    await connectDB();
    
    // Check if user is admin first
    const admin = await Admin.findById(userId).lean() as AdminDocument | null;
    if (admin) {
      console.log('🔍 getCurrentUserWithProgress - User is admin');
      return {
        ...admin,
        _id: admin._id.toString(),
        role: 'admin',
        preferredLanguage: 'python',
        roadmapProgress: [],
        learningStats: {
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
        activityLog: []
      };
    }

    // If not admin, get student
    const student = await Student.findById(userId)
      .select('+roadmapProgress +learningStats +activityLog preferredLanguage')
      .lean() as StudentDocument | null;
    
    if (!student) {
      return null;
    }
    
    // Normalize role
    const normalizedRole = student.role?.toLowerCase();
    
    return {
      ...student,
      role: normalizedRole,
      preferredLanguage: student.preferredLanguage || 'python',
      roadmapProgress: student.roadmapProgress || [],
      learningStats: student.learningStats || {
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
      activityLog: []
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
    
    // Check if user is admin
    const admin = await Admin.findById(userId);
    if (admin) {
      // Admins don't have learning stats, so we skip this
      console.log('🔍 updateUserLastActive - User is admin, skipping learning stats update');
      return;
    }

    // Update student learning stats
    await Student.findByIdAndUpdate(userId, {
      $set: {
        'learningStats.lastActive': new Date()
      },
      $inc: {
        'learningStats.loginCount': 1
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
    
    // Check if user is admin
    const admin = await Admin.findById(userId);
    if (admin) {
      console.log('🔍 initializeUserData - User is admin, no initialization needed');
      return;
    }

    // Initialize student data
    const student = await Student.findById(userId);
    if (!student) return;

    // Use type assertion for student document
    const studentDoc = student as any;
    
    // Initialize preferredLanguage if it doesn't exist
    if (!studentDoc.preferredLanguage) {
      studentDoc.preferredLanguage = 'python';
    }
    
    // Initialize languages if it doesn't exist
    if (!studentDoc.languages) {
      studentDoc.languages = [];
    }
    
    // Initialize roadmapProgress if it doesn't exist
    if (!studentDoc.roadmapProgress) {
      studentDoc.roadmapProgress = [];
    }
    
    // Initialize learningStats with default values if missing
    if (!studentDoc.learningStats) {
      studentDoc.learningStats = {
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
    if (!studentDoc.activityLog) {
      studentDoc.activityLog = [];
    }
    
    await studentDoc.save();
  } catch (error) {
    console.error('Error initializing user data:', error);
  }
}

// Simple function to get user data from cookie without DB call (for middleware)
export async function getUserFromCookie(): Promise<{ id: string; role: string; name: string; email: string } | null> {
  try {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get('user-data')?.value;

    if (!userDataCookie) {
      return null;
    }

    const userData = JSON.parse(userDataCookie);
    return {
      id: userData.id || userData._id,
      role: userData.role,
      name: userData.name,
      email: userData.email
    };
  } catch (error) {
    console.error('Error getting user from cookie:', error);
    return null;
  }
}