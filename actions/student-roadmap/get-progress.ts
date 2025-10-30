'use server';

import { connectDB } from '@/lib/db';
import { cookies } from 'next/headers';
import type { ProgressActionResponse, ProgressData } from '@/types/student-roadmap';

// Helper function to serialize MongoDB data for client components
function serializeForClient(data: any): any {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeForClient(item));
  }
  
  if (typeof data === 'object') {
    // Handle MongoDB ObjectId
    if (data._id && typeof data._id === 'object' && data._id.toString) {
      data._id = data._id.toString();
    }
    
    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString();
    }
    
    // Handle other objects
    const result: any = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = serializeForClient(value);
    }
    return result;
  }
  
  return data;
}

async function getCurrentStudent() {
  try {
    const cookieStore = await cookies();
    const studentCookie = cookieStore.get('student-session-v2');
    
    if (!studentCookie?.value) return null;
    
    const studentData = JSON.parse(studentCookie.value);
    return studentData.role === 'student' ? studentData : null;
  } catch (error) {
    console.error('Error getting current student from session:', error);
    return null;
  }
}

export async function getRoadmapProgressAction(
  userId: string, 
  languageId?: string, 
  year?: number
): Promise<ProgressActionResponse> {
  try {
    await connectDB();
    
    const currentStudent = await getCurrentStudent();
    if (!currentStudent || currentStudent.id !== userId) {
      return { 
        success: false, 
        error: 'Access denied' 
      };
    }
    
    console.log(`📊 Getting progress for student ${userId}, language: ${languageId}, year: ${year}`);
    
    // Mock progress data - replace with actual progress fetching from your database
    const progress: ProgressData[] = [
      {
        stepId: 'step-1',
        completed: true,
        progress: 100,
        timeSpent: 120,
        resourcesViewed: 3,
        lastAccessed: new Date()
      },
      {
        stepId: 'step-2', 
        completed: false,
        progress: 50,
        timeSpent: 60,
        resourcesViewed: 2,
        lastAccessed: new Date()
      }
    ];
    
    return { 
      success: true, 
      data: { progress: serializeForClient(progress) }
    };
  } catch (error) {
    console.error('❌ Error getting roadmap progress:', error);
    return { success: false, error: 'Failed to load progress' };
  }
}