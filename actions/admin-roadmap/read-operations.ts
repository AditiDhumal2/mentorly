// actions/admin-roadmap/read-operations.ts
'use server';

import { Roadmap } from '@/models/Roadmap';
import { connectDB } from '@/lib/db';
import type { 
  Roadmap as RoadmapType, 
  RoadmapActionResponse, 
  RoadmapsActionResponse 
} from '@/types/admin-roadmap';

export async function getRoadmapAction(
  year: number, 
  language: string
): Promise<RoadmapActionResponse> {
  try {
    await connectDB();
    
    const roadmap = await Roadmap.findOne({
      year,
      language
    }).lean();

    if (!roadmap) {
      return {
        success: false,
        error: 'Roadmap not found',
        data: null
      };
    }

    const roadmapData = transformRoadmapData(roadmap);
    
    const sortedSteps = roadmapData.steps.sort((a: any, b: any) => {
      return a.priority - b.priority;
    });

    return {
      success: true,
      data: {
        ...roadmapData,
        steps: sortedSteps
      }
    };
  } catch (error) {
    console.error('Error fetching roadmap:', error);
    return {
      success: false,
      error: 'Failed to fetch roadmap',
      data: null
    };
  }
}

export async function getAllRoadmapsAction(): Promise<RoadmapsActionResponse> {
  try {
    await connectDB();
    
    const roadmaps = await Roadmap.find({})
      .sort({ year: 1, language: 1 })
      .lean();

    const roadmapsData = roadmaps.map(roadmap => transformRoadmapData(roadmap));

    return {
      success: true,
      data: roadmapsData
    };
  } catch (error: any) {
    console.error('Error fetching all roadmaps:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch roadmaps',
      data: null
    };
  }
}

function transformRoadmapData(roadmap: any): RoadmapType {
  return {
    ...roadmap,
    _id: roadmap._id.toString(),
    steps: (roadmap.steps || []).map((step: any) => ({
      ...step,
      _id: step._id.toString(),
      resources: (step.resources || []).map((resource: any) => ({
        ...resource,
        _id: resource._id?.toString()
      })),
      prerequisites: step.prerequisites || [],
      applyToAllLanguages: step.applyToAllLanguages || false
    })),
    quickActions: (roadmap.quickActions || []).map((action: any) => ({
      ...action,
      _id: action._id?.toString(),
      resources: (action.resources || []).map((resource: any) => ({
        ...resource,
        _id: resource._id?.toString()
      }))
    }))
  };
}