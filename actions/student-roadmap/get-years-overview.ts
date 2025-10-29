// actions/student-roadmap/get-years-overview.ts
'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import { cookies } from 'next/headers';
import type { YearsOverviewActionResponse, YearOverview, RoadmapData } from '@/types/student-roadmap';
import { Types } from 'mongoose';

// Type for the roadmap document from MongoDB
interface RoadmapDocument {
  _id: Types.ObjectId;
  year: number;
  language: string;
  title: string;
  description: string;
  steps: Array<{
    _id: Types.ObjectId;
    title: string;
    description: string;
    category: string;
    resources: Array<{
      _id?: Types.ObjectId;
      title: string;
      url: string;
      type: string;
      description?: string;
      duration?: string;
    }>;
    estimatedDuration: string;
    priority: number;
    languageSpecific: boolean;
    prerequisites: string[];
    year?: number;
    language?: string;
    order?: number;
    applyToAllLanguages?: boolean;
  }>;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
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

function getLanguageName(language: string): string {
  const names: Record<string, string> = {
    python: 'Python',
    javascript: 'JavaScript',
    java: 'Java',
    cpp: 'C++',
    go: 'Go',
    rust: 'Rust'
  };
  return names[language] || language.charAt(0).toUpperCase() + language.slice(1);
}

function getYearLabel(year: number): string {
  const labels: Record<number, string> = {
    1: '1st Year - Foundation',
    2: '2nd Year - Skill Development', 
    3: '3rd Year - Specialization',
    4: '4th Year - Placement Preparation'
  };
  return labels[year] || `Year ${year}`;
}

export async function getRoadmapYearsOverview(userId: string, languageId: string): Promise<YearsOverviewActionResponse> {
  try {
    const currentStudent = await getCurrentStudent();
    if (!currentStudent || currentStudent.id !== userId) {
      return { 
        success: false, 
        error: 'Access denied' 
      };
    }
    
    await connectDB();
    
    const years = [1, 2, 3, 4];
    const overview: YearOverview[] = [];
    
    for (const year of years) {
      // Use proper typing for the MongoDB query
      const roadmap = await Roadmap.findOne({ 
        year, 
        language: languageId.toLowerCase() 
      }).lean<RoadmapDocument>();
      
      if (roadmap) {
        overview.push({
          year,
          title: roadmap.title,
          description: roadmap.description,
          totalSteps: roadmap.steps?.length || 0,
          available: true,
          label: getYearLabel(year)
        });
      } else {
        // Check if default language roadmap exists with proper typing
        const defaultRoadmap = await Roadmap.findOne({ 
          year, 
          language: 'python' 
        }).lean<RoadmapDocument>();
        
        overview.push({
          year,
          title: `${getLanguageName(languageId)} Year ${year} Roadmap`,
          description: `Learning path for ${getLanguageName(languageId)} in year ${year}`,
          totalSteps: defaultRoadmap?.steps?.length || 8,
          available: !!defaultRoadmap,
          isFallback: true,
          label: getYearLabel(year)
        });
      }
    }
    
    return { success: true, data: overview };
  } catch (error) {
    console.error('❌ Error getting roadmap years overview:', error);
    return { success: false, error: 'Failed to load years overview' };
  }
}