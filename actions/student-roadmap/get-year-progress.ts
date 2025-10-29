// actions/student-roadmap/get-year-progress.ts
'use server';

import { cookies } from 'next/headers';
import type { YearProgressActionResponse, YearProgress } from '@/types/student-roadmap';

// Helper function to serialize data for client components
function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeForClient(item)) as T;
  }
  
  if (typeof data === 'object') {
    // Handle Date objects
    if (data instanceof Date) {
      return data.toISOString() as T;
    }
    
    // Handle other objects
    const result: any = {};
    for (const [key, value] of Object.entries(data as object)) {
      result[key] = serializeForClient(value);
    }
    return result as T;
  }
  
  return data;
}

// Helper function to get current student from session
async function getCurrentStudent(): Promise<{ id: string; role: string } | null> {
  try {
    const cookieStore = await cookies();
    const studentCookie = cookieStore.get('student-session-v2');
    
    if (!studentCookie?.value) return null;
    
    const studentData = JSON.parse(studentCookie.value) as { id: string; role: string };
    return studentData.role === 'student' ? studentData : null;
  } catch (error) {
    console.error('Error getting current student from session:', error);
    return null;
  }
}

export async function getUserYearProgressAction(userId: string): Promise<YearProgressActionResponse> {
  try {
    const currentStudent = await getCurrentStudent();
    if (!currentStudent || currentStudent.id !== userId) {
      return { 
        success: false, 
        error: 'Access denied' 
      };
    }
    
    // Mock data - replace with actual progress data from your database
    const yearProgress: Record<number, YearProgress> = {
      1: { completed: 8, total: 12, progress: 67 },
      2: { completed: 3, total: 15, progress: 20 },
      3: { completed: 0, total: 10, progress: 0 },
      4: { completed: 0, total: 8, progress: 0 }
    };
    
    return { 
      success: true, 
      data: serializeForClient(yearProgress)
    };
  } catch (error) {
    console.error('❌ Error getting user year progress:', error);
    return { success: false, error: 'Failed to load year progress' };
  }
}