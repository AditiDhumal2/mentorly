'use server';

import { connectDB } from '../lib/db';
import { Roadmap } from '../models/Roadmap';
import { User } from '../models/User';
import { revalidatePath } from 'next/cache';

// Helper function to convert to plain objects
function convertToPlainObject(doc: any): any {
  return JSON.parse(JSON.stringify(doc));
}

// Get detailed progress analytics
export async function getProgressAnalyticsAction(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('roadmapProgress learningStats activityLog year name email')
      .lean();

    if (!user) {
      return { success: false, error: 'User not found', data: null };
    }

    const plainUser = convertToPlainObject(user);
    
    // Calculate additional analytics
    const totalSteps = await Roadmap.findOne({ year: plainUser.year })
      .select('steps')
      .lean();
    
    // Type assertion for roadmap data
    const roadmapData = totalSteps as any;
    const totalStepsCount = roadmapData?.steps?.length || 0;
    
    const completionRate = totalStepsCount > 0 
      ? (plainUser.learningStats?.stepsCompleted / totalStepsCount) * 100 
      : 0;

    // Get recent activity (last 10 activities)
    const recentActivity = plainUser.activityLog
      ?.slice(-10)
      .reverse() || [];

    // Calculate daily activity for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toDateString();
    }).reverse();

    const dailyActivity = last7Days.map(date => {
      const dayActivities = plainUser.activityLog?.filter((activity: any) => 
        new Date(activity.timestamp).toDateString() === date
      ) || [];
      return {
        date,
        count: dayActivities.length,
        activities: dayActivities
      };
    });

    return { 
      success: true, 
      data: {
        userInfo: {
          name: plainUser.name,
          email: plainUser.email,
          year: plainUser.year
        },
        progress: plainUser.roadmapProgress || [],
        learningStats: plainUser.learningStats || {},
        recentActivity: recentActivity,
        dailyActivity: dailyActivity,
        analytics: {
          completionRate: Math.round(completionRate),
          totalSteps: totalStepsCount,
          completedSteps: plainUser.learningStats?.stepsCompleted || 0,
          remainingSteps: totalStepsCount - (plainUser.learningStats?.stepsCompleted || 0),
          resourcesViewed: plainUser.learningStats?.resourcesViewed || 0,
          totalTimeSpent: plainUser.learningStats?.totalTimeSpent || 0,
          currentStreak: plainUser.learningStats?.currentStreak || 0,
          longestStreak: plainUser.learningStats?.longestStreak || 0,
          loginCount: plainUser.learningStats?.loginCount || 0,
        }
      }
    };
  } catch (error) {
    console.error('Error fetching progress analytics:', error);
    return { 
      success: false, 
      error: 'Failed to fetch progress analytics',
      data: null
    };
  }
}

// Get all students progress (for mentors/admins)
export async function getAllStudentsProgressAction() {
  try {
    await connectDB();
    
    const students = await User.find({ role: 'student' })
      .select('name email year college learningStats roadmapProgress createdAt')
      .lean();

    const plainStudents = students.map(convertToPlainObject);

    // Calculate progress for each student
    const studentsWithProgress = await Promise.all(
      plainStudents.map(async (student: any) => {
        const totalSteps = await Roadmap.findOne({ year: student.year })
          .select('steps')
          .lean();
        
        // Type assertion for roadmap data
        const roadmapData = totalSteps as any;
        const totalStepsCount = roadmapData?.steps?.length || 0;
        const completedSteps = student.learningStats?.stepsCompleted || 0;
        const completionRate = totalStepsCount > 0 
          ? (completedSteps / totalStepsCount) * 100 
          : 0;

        return {
          ...student,
          analytics: {
            completionRate: Math.round(completionRate),
            totalSteps: totalStepsCount,
            completedSteps: completedSteps,
            currentStreak: student.learningStats?.currentStreak || 0,
            lastActive: student.learningStats?.lastActive || student.createdAt,
          }
        };
      })
    );

    return { 
      success: true, 
      data: studentsWithProgress 
    };
  } catch (error) {
    console.error('Error fetching all students progress:', error);
    return { 
      success: false, 
      error: 'Failed to fetch students progress',
      data: null
    };
  }
}

// Existing functions remain the same
export async function getRoadmapAction(year: number) {
  try {
    await connectDB();
    
    const roadmap = await Roadmap.findOne({ year })
      .select('year title description steps')
      .lean();
    
    if (!roadmap) {
      return { 
        success: false, 
        error: 'Roadmap not found for this year',
        data: null
      };
    }
    
    const plainRoadmap = convertToPlainObject(roadmap);
    return { success: true, data: plainRoadmap };
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return { 
      success: false, 
      error: 'Failed to fetch roadmap from database',
      data: null
    };
  }
}

export async function getRoadmapProgressAction(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId)
      .select('roadmapProgress year')
      .lean();
    
    if (!user) {
      return { success: false, error: 'User not found', data: null };
    }
    
    const plainUser = convertToPlainObject(user);
    
    return { 
      success: true, 
      data: {
        progress: plainUser.roadmapProgress || [],
        currentYear: plainUser.year
      }
    };
  } catch (error) {
    console.error('Error fetching roadmap progress:', error);
    return { 
      success: false, 
      error: 'Failed to fetch progress from database',
      data: null
    };
  }
}