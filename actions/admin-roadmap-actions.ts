// app/actions/roadmap-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { Roadmap } from '@/models/Roadmap';
import mongoose from 'mongoose';

// Types matching the frontend
interface Resource {
  _id?: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'exercise' | 'quiz';
  description?: string;
  duration?: string;
}

interface RoadmapStep {
  _id?: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
  languageSpecific: boolean;
  resources: Resource[];
  prerequisites: string[];
  year: number;
  language: string;
  order?: number;
}

// Connect to MongoDB if not already connected
async function connectToDatabase() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  return mongoose.connect(MONGODB_URI);
}

export async function getRoadmapAction(year: number, language: string) {
  try {
    await connectToDatabase();
    
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

    // Convert Mongoose document to plain object and handle _id conversion
    const roadmapData = {
      ...roadmap,
      _id: (roadmap as any)._id?.toString(),
      steps: ((roadmap as any).steps || []).map((step: any) => ({
        ...step,
        _id: step._id?.toString(),
        resources: (step.resources || []).map((resource: any) => ({
          ...resource,
          _id: resource._id?.toString()
        })),
        prerequisites: step.prerequisites || []
      }))
    };

    // Ensure steps are sorted by priority
    const sortedSteps = roadmapData.steps.sort((a: RoadmapStep, b: RoadmapStep) => {
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

export async function createRoadmapStepAction(stepData: Omit<RoadmapStep, '_id'>) {
  try {
    await connectToDatabase();
    
    const { year, language } = stepData;
    
    // First, get or create the roadmap
    let roadmap = await Roadmap.findOne({ year, language });
    
    if (!roadmap) {
      // Create a new roadmap if it doesn't exist
      roadmap = new Roadmap({
        year,
        language,
        title: `Year ${year} ${language.charAt(0).toUpperCase() + language.slice(1)} Roadmap`,
        description: `Learning roadmap for ${language} in year ${year}`,
        steps: []
      });
    }

    // Create the new step (Mongoose will automatically generate _id)
    const newStep = {
      title: stepData.title,
      description: stepData.description,
      category: stepData.category,
      priority: stepData.priority,
      estimatedDuration: stepData.estimatedDuration,
      languageSpecific: stepData.languageSpecific,
      resources: stepData.resources.map(resource => ({
        title: resource.title,
        url: resource.url,
        type: resource.type,
        description: resource.description,
        duration: resource.duration
      })),
      prerequisites: stepData.prerequisites || []
    };

    // Add the step to the roadmap
    roadmap.steps.push(newStep as any);
    await roadmap.save();

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Step created successfully'
    };
  } catch (error: any) {
    console.error('Error creating roadmap step:', error);
    
    if (error.code === 11000) {
      return {
        success: false,
        error: 'A roadmap for this year and language already exists'
      };
    }
    
    return {
      success: false,
      error: error.message || 'Failed to create step'
    };
  }
}

export async function updateRoadmapStepAction(stepId: string, stepData: Partial<RoadmapStep>) {
  try {
    await connectToDatabase();
    
    // Find the roadmap containing this step
    const roadmap = await Roadmap.findOne({
      'steps._id': stepId
    });

    if (!roadmap) {
      return {
        success: false,
        error: 'Step not found'
      };
    }

    // Find the step index
    const stepIndex = roadmap.steps.findIndex(
      (step: any) => step._id.toString() === stepId
    );

    if (stepIndex === -1) {
      return {
        success: false,
        error: 'Step not found'
      };
    }

    // Update the step fields
    if (stepData.title !== undefined) {
      roadmap.steps[stepIndex].title = stepData.title;
    }
    if (stepData.description !== undefined) {
      roadmap.steps[stepIndex].description = stepData.description;
    }
    if (stepData.category !== undefined) {
      roadmap.steps[stepIndex].category = stepData.category;
    }
    if (stepData.priority !== undefined) {
      roadmap.steps[stepIndex].priority = stepData.priority;
    }
    if (stepData.estimatedDuration !== undefined) {
      roadmap.steps[stepIndex].estimatedDuration = stepData.estimatedDuration;
    }
    if (stepData.languageSpecific !== undefined) {
      roadmap.steps[stepIndex].languageSpecific = stepData.languageSpecific;
    }
    if (stepData.resources !== undefined) {
      roadmap.steps[stepIndex].resources = stepData.resources.map(resource => ({
        title: resource.title,
        url: resource.url,
        type: resource.type,
        description: resource.description,
        duration: resource.duration
      })) as any;
    }
    if (stepData.prerequisites !== undefined) {
      (roadmap.steps[stepIndex] as any).prerequisites = stepData.prerequisites;
    }

    await roadmap.save();

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Step updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating roadmap step:', error);
    return {
      success: false,
      error: error.message || 'Failed to update step'
    };
  }
}

export async function deleteRoadmapStepAction(stepId: string) {
  try {
    await connectToDatabase();
    
    const result = await Roadmap.findOneAndUpdate(
      {
        'steps._id': stepId
      },
      {
        $pull: { steps: { _id: stepId } }
      },
      {
        new: true
      }
    );

    if (!result) {
      return {
        success: false,
        error: 'Step not found or already deleted'
      };
    }

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Step deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting roadmap step:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete step'
    };
  }
}

export async function reorderRoadmapStepsAction(roadmapId: string, newOrder: string[]) {
  try {
    await connectToDatabase();
    
    const roadmap = await Roadmap.findById(roadmapId);

    if (!roadmap) {
      return {
        success: false,
        error: 'Roadmap not found'
      };
    }

    // Create a map of step IDs to their positions in the new order
    const stepOrderMap = new Map();
    newOrder.forEach((stepId, index) => {
      stepOrderMap.set(stepId, index);
    });

    // Sort the steps array based on the new order
    roadmap.steps.sort((a: any, b: any) => {
      const orderA = stepOrderMap.get(a._id.toString()) || 0;
      const orderB = stepOrderMap.get(b._id.toString()) || 0;
      return orderA - orderB;
    });

    await roadmap.save();

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Steps reordered successfully'
    };
  } catch (error: any) {
    console.error('Error reordering roadmap steps:', error);
    return {
      success: false,
      error: error.message || 'Failed to reorder steps'
    };
  }
}

// Additional utility functions (if they exist in your current file)
export async function getAllRoadmapsAction() {
  try {
    await connectToDatabase();
    
    const roadmaps = await Roadmap.find({})
      .sort({ year: 1, language: 1 })
      .lean();

    const roadmapsData = roadmaps.map(roadmap => ({
      ...roadmap,
      _id: (roadmap as any)._id.toString(),
      steps: ((roadmap as any).steps || []).map((step: any) => ({
        ...step,
        _id: step._id.toString(),
        resources: (step.resources || []).map((resource: any) => ({
          ...resource,
          _id: resource._id?.toString()
        })),
        prerequisites: step.prerequisites || []
      }))
    }));

    return {
      success: true,
      data: roadmapsData
    };
  } catch (error: any) {
    console.error('Error fetching all roadmaps:', error);
    return {
      success: false,
      error: error.message || 'Failed to fetch roadmaps',
      data: []
    };
  }
}