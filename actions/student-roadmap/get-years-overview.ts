'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import { cookies } from 'next/headers';
import type { YearsOverviewActionResponse, YearOverview } from '@/types/student-roadmap';
import type { RoadmapDocument } from '@/types/roadmap-base';

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
      // Use the shared RoadmapDocument type
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
        // Check if default language roadmap exists
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