// actions/student-roadmap/get-roadmap.ts
'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import type { RoadmapActionResponse, RoadmapData, RoadmapStep, Resource } from '@/types/student-roadmap';
import { Types } from 'mongoose';

// Helper function to serialize MongoDB data for client components
function serializeForClient<T>(data: T): T {
  if (data === null || data === undefined) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => serializeForClient(item)) as T;
  }
  
  if (typeof data === 'object') {
    // Handle MongoDB ObjectId
    if ((data as any)._id && (data as any)._id instanceof Types.ObjectId) {
      (data as any)._id = (data as any)._id.toString();
    }
    
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

// Helper function to get language name
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

// Helper function to get tutorial URL
function getLanguageTutorialUrl(language: string): string {
  const urls: Record<string, string> = {
    python: 'https://youtube.com/playlist?list=PL-osiE80TeTsWmV9i9c58mdDCSskIFdDS',
    javascript: 'https://youtube.com/playlist?list=PLillGF-RfqbbnEGy3ROiLWk7JMCuSyQtX',
    java: 'https://youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7AW9ftq0AtAyYqJ',
    cpp: 'https://youtube.com/playlist?list=PLfqMhTWNBTe0b2nM6JHVCnAkhQRGiZMSJ',
    go: 'https://youtube.com/playlist?list=PLRAV69dS1uWQGDQoBYMZWKjzuhEdOn6S9',
    rust: 'https://youtube.com/playlist?list=PLai5B987bZ9CoVR-QEIN9foz4QCJ0H2Y8'
  };
  return urls[language] || 'https://youtube.com';
}

// Helper function to create basic roadmap when none exists
async function createBasicRoadmap(year: number, languageId: string): Promise<RoadmapData> {
  const basicRoadmap: RoadmapData = {
    year,
    language: languageId,
    title: `${getLanguageName(languageId)} Year ${year} Roadmap`,
    description: `Your learning path for ${getLanguageName(languageId)} in year ${year}. Start with fundamentals and build real projects.`,
    steps: [
      {
        _id: `step-${languageId}-${year}-1`,
        title: `Learn ${getLanguageName(languageId)} Basics`,
        description: `Master fundamental ${getLanguageName(languageId)} programming concepts including syntax, variables, data types, and control structures.`,
        category: 'fundamentals',
        resources: [
          {
            title: `${getLanguageName(languageId)} Full Course for Beginners`,
            url: getLanguageTutorialUrl(languageId),
            type: 'video' as const
          }
        ],
        estimatedDuration: '3-4 weeks',
        priority: 1,
        languageSpecific: true,
        prerequisites: [],
        year,
        language: languageId
      },
      {
        _id: `step-${languageId}-${year}-2`,
        title: 'Build Your First Project',
        description: 'Apply your knowledge by building a simple application or script to solve a real problem.',
        category: 'project',
        resources: [
          {
            title: 'Beginner Project Ideas',
            url: 'https://github.com/MunGell/awesome-for-beginners',
            type: 'article' as const
          }
        ],
        estimatedDuration: '2 weeks',
        priority: 2,
        languageSpecific: false,
        prerequisites: [],
        year,
        language: languageId
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const roadmap = new Roadmap(basicRoadmap);
  await roadmap.save();
  
  console.log(`✅ Created basic roadmap for ${languageId} year ${year}`);
  return basicRoadmap;
}

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

// Helper function to convert MongoDB step to RoadmapStep
function convertToRoadmapStep(step: RoadmapDocument['steps'][0], roadmapYear: number, roadmapLanguage: string): RoadmapStep {
  return {
    _id: step._id.toString(),
    title: step.title,
    description: step.description,
    category: step.category,
    resources: step.resources.map(resource => ({
      _id: resource._id?.toString(),
      title: resource.title,
      url: resource.url,
      type: resource.type as 'video' | 'article' | 'documentation' | 'exercise' | 'quiz',
      description: resource.description,
      duration: resource.duration
    })),
    estimatedDuration: step.estimatedDuration,
    priority: step.priority,
    languageSpecific: step.languageSpecific,
    prerequisites: step.prerequisites,
    year: step.year, // Now optional, so no issue
    language: step.language ?? roadmapLanguage,
    order: step.order,
    applyToAllLanguages: step.applyToAllLanguages
  };
}

export async function getRoadmapAction(year: number, languageId: string = 'python'): Promise<RoadmapActionResponse> {
  try {
    await connectDB();
    
    console.log(`📚 Fetching roadmap for year ${year}, language: ${languageId}`);
    
    // Validate inputs
    if (!year || year < 1 || year > 4) {
      return { 
        success: false, 
        error: 'Invalid year. Year must be between 1 and 4.' 
      };
    }

    if (!languageId) {
      languageId = 'python';
    }

    // Get roadmap for specific year and language with proper typing
    const roadmap = await Roadmap.findOne({ 
      year: year,
      language: languageId.toLowerCase()
    }).lean<RoadmapDocument>();

    if (!roadmap) {
      console.log(`📚 No roadmap found for year ${year}, language: ${languageId}. Falling back to default language.`);
      
      // Fallback to default language (python) if specific language roadmap doesn't exist
      const defaultRoadmap = await Roadmap.findOne({ 
        year: year, 
        language: 'python' 
      }).lean<RoadmapDocument>();
      
      if (!defaultRoadmap) {
        console.log(`📚 No default roadmap found. Creating basic roadmap for ${languageId} year ${year}`);
        const basicRoadmap = await createBasicRoadmap(year, languageId);
        const serializedRoadmap: RoadmapData = {
          ...basicRoadmap,
          isFallback: true,
          requestedLanguage: languageId
        };
        return { 
          success: true, 
          data: serializeForClient(serializedRoadmap)
        };
      }
      
      // Convert the default roadmap to RoadmapData type
      const serializedDefaultRoadmap: RoadmapData = {
        _id: defaultRoadmap._id.toString(),
        year: defaultRoadmap.year,
        language: defaultRoadmap.language,
        title: defaultRoadmap.title,
        description: defaultRoadmap.description,
        steps: defaultRoadmap.steps.map(step => 
          convertToRoadmapStep(step, defaultRoadmap.year, defaultRoadmap.language)
        ),
        createdAt: defaultRoadmap.createdAt,
        updatedAt: defaultRoadmap.updatedAt,
        isFallback: true,
        requestedLanguage: languageId
      };
      
      return { 
        success: true, 
        data: serializeForClient(serializedDefaultRoadmap)
      };
    }

    // Convert the found roadmap to RoadmapData type
    const serializedRoadmap: RoadmapData = {
      _id: roadmap._id.toString(),
      year: roadmap.year,
      language: roadmap.language,
      title: roadmap.title,
      description: roadmap.description,
      steps: roadmap.steps.map(step => 
        convertToRoadmapStep(step, roadmap.year, roadmap.language)
      ),
      createdAt: roadmap.createdAt,
      updatedAt: roadmap.updatedAt
    };

    console.log(`✅ Found roadmap for ${languageId} year ${year}`);
    return { success: true, data: serializeForClient(serializedRoadmap) };
  } catch (error) {
    console.error('❌ Error getting roadmap:', error);
    return { success: false, error: 'Failed to load roadmap' };
  }
}