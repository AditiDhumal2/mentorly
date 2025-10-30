'use server';

import { revalidatePath } from 'next/cache';
import { Roadmap } from '@/models/Roadmap';
import { connectDB } from '@/lib/db';
import type { 
  CreateRoadmapStepPayload, 
  UpdateRoadmapStepPayload,
  ActionResponse 
} from '@/types/admin-roadmap';

export async function createRoadmapStepAction(
  stepData: CreateRoadmapStepPayload
): Promise<ActionResponse> {
  try {
    await connectDB();
    
    const { year, language, applyToAllLanguages } = stepData;
    
    if (applyToAllLanguages) {
      const allLanguages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];
      
      for (const lang of allLanguages) {
        let roadmap = await Roadmap.findOne({ year, language: lang });
        
        if (!roadmap) {
          roadmap = new Roadmap({
            year,
            language: lang,
            title: `Year ${year} ${lang.charAt(0).toUpperCase() + lang.slice(1)} Roadmap`,
            description: `Learning roadmap for ${lang} in year ${year}`,
            steps: [],
            quickActions: []
          });
        }

        const newStep = {
          ...stepData,
          languageSpecific: false,
          applyToAllLanguages: true
        };

        roadmap.steps.push(newStep as any);
        await roadmap.save();
      }
      
      revalidatePath('/admin/roadmap');
      return {
        success: true,
        message: `Step created for all ${allLanguages.length} languages`
      };
    } else {
      let roadmap = await Roadmap.findOne({ year, language });
      
      if (!roadmap) {
        roadmap = new Roadmap({
          year,
          language,
          title: `Year ${year} ${language.charAt(0).toUpperCase() + language.slice(1)} Roadmap`,
          description: `Learning roadmap for ${language} in year ${year}`,
          steps: [],
          quickActions: []
        });
      }

      const newStep = {
        ...stepData,
        applyToAllLanguages: false
      };

      roadmap.steps.push(newStep as any);
      await roadmap.save();

      revalidatePath('/admin/roadmap');
      return {
        success: true,
        message: 'Step created successfully'
      };
    }
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

export async function updateRoadmapStepAction(
  stepId: string, 
  stepData: UpdateRoadmapStepPayload
): Promise<ActionResponse> {
  try {
    await connectDB();
    
    const roadmap = await Roadmap.findOne({
      'steps._id': stepId
    });

    if (!roadmap) {
      return {
        success: false,
        error: 'Step not found'
      };
    }

    const stepIndex = roadmap.steps.findIndex(
      (step: any) => step._id.toString() === stepId
    );

    if (stepIndex === -1) {
      return {
        success: false,
        error: 'Step not found'
      };
    }

    const currentStep = roadmap.steps[stepIndex];
    
    if (currentStep.applyToAllLanguages && !stepData.applyToAllLanguages) {
      // Handle removing from "Apply to All Languages"
      const allLanguages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];
      
      for (const lang of allLanguages) {
        if (lang === roadmap.language) continue;
        
        const targetRoadmap = await Roadmap.findOne({ year: roadmap.year, language: lang });
        if (targetRoadmap) {
          targetRoadmap.steps = targetRoadmap.steps.filter(
            (step: any) => !(step.applyToAllLanguages && step.title === currentStep.title)
          );
          await targetRoadmap.save();
        }
      }
      
      roadmap.steps[stepIndex] = {
        ...currentStep,
        ...stepData,
        applyToAllLanguages: false,
        languageSpecific: true
      };
      
      await roadmap.save();
      
    } else if (stepData.applyToAllLanguages && !currentStep.applyToAllLanguages) {
      // Step was language-specific, now applying to all languages
      roadmap.steps.splice(stepIndex, 1);
      await roadmap.save();
      
      const allLanguages = ['python', 'javascript', 'java', 'cpp', 'go', 'rust'];
      
      for (const lang of allLanguages) {
        let targetRoadmap = await Roadmap.findOne({ year: roadmap.year, language: lang });
        
        if (!targetRoadmap) {
          targetRoadmap = new Roadmap({
            year: roadmap.year,
            language: lang,
            title: `Year ${roadmap.year} ${lang.charAt(0).toUpperCase() + lang.slice(1)} Roadmap`,
            description: `Learning roadmap for ${lang} in year ${roadmap.year}`,
            steps: [],
            quickActions: []
          });
        }

        const updatedStep = {
          ...stepData,
          languageSpecific: false,
          applyToAllLanguages: true
        };

        const existingStepIndex = targetRoadmap.steps.findIndex(
          (step: any) => step.applyToAllLanguages && step.title === updatedStep.title
        );

        if (existingStepIndex !== -1) {
          targetRoadmap.steps[existingStepIndex] = {
            ...targetRoadmap.steps[existingStepIndex],
            ...updatedStep
          };
        } else {
          targetRoadmap.steps.push(updatedStep as any);
        }
        
        await targetRoadmap.save();
      }
      
      revalidatePath('/admin/roadmap');
      return {
        success: true,
        message: `Step updated for all ${allLanguages.length} languages`
      };
    } else {
      // Regular update
      roadmap.steps[stepIndex] = {
        ...roadmap.steps[stepIndex],
        ...stepData
      };
      await roadmap.save();
    }

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

export async function deleteRoadmapStepAction(
  stepId: string
): Promise<ActionResponse> {
  try {
    await connectDB();
    
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

export async function reorderRoadmapStepsAction(
  roadmapId: string, 
  newOrder: string[]
): Promise<ActionResponse> {
  try {
    await connectDB();
    
    const roadmap = await Roadmap.findById(roadmapId);

    if (!roadmap) {
      return {
        success: false,
        error: 'Roadmap not found'
      };
    }

    const stepOrderMap = new Map();
    newOrder.forEach((stepId, index) => {
      stepOrderMap.set(stepId, index);
    });

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