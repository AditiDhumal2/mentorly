// actions/admin-roadmap/quick-actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { Roadmap } from '@/models/Roadmap';
import { connectDB } from '@/lib/db';
import type { 
  QuickAction, 
  CreateQuickActionPayload, 
  UpdateQuickActionPayload,
  ActionResponse  
} from '@/types/admin-roadmap';

export async function createQuickAction(
  roadmapId: string, 
  actionData: CreateQuickActionPayload
): Promise<ActionResponse> { 
  try {
    await connectDB();
    
    const { year, language } = actionData;
    
    if (!year || !language) {
      return { 
        success: false, 
        error: 'Year and language are required for quick actions' 
      };
    }
    
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

    const quickActionData = {
      ...actionData,
      isActive: actionData.isActive !== undefined ? actionData.isActive : true
    };

    roadmap.quickActions.push(quickActionData as any);
    await roadmap.save();

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Quick action created successfully'
    };
  } catch (error: any) {
    console.error('Error creating quick action:', error);
    return {
      success: false,
      error: error.message || 'Failed to create quick action'
    };
  }
}

export async function updateQuickAction(
  roadmapId: string, 
  actionId: string, 
  actionData: UpdateQuickActionPayload
): Promise<ActionResponse> {  // ✅ FIXED: Changed return type
  try {
    await connectDB();
    
    const { year, language } = actionData as any;
    
    if (!year || !language) {
      return { 
        success: false, 
        error: 'Year and language are required for updating quick actions' 
      };
    }
    
    const roadmap = await Roadmap.findOne({ year, language });
    
    if (!roadmap) {
      return { success: false, error: 'Roadmap not found' };
    }

    const actionIndex = roadmap.quickActions.findIndex(
      (action: any) => action._id.toString() === actionId
    );

    if (actionIndex === -1) {
      return { success: false, error: 'Quick action not found' };
    }

    roadmap.quickActions[actionIndex] = {
      ...roadmap.quickActions[actionIndex],
      ...actionData
    };
    await roadmap.save();

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Quick action updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating quick action:', error);
    return {
      success: false,
      error: error.message || 'Failed to update quick action'
    };
  }
}

export async function deleteQuickAction(
  roadmapId: string, 
  actionId: string
): Promise<ActionResponse> {  // ✅ FIXED: Changed return type
  try {
    await connectDB();
    
    const roadmap = await Roadmap.findOne({
      'quickActions._id': actionId
    });

    if (!roadmap) {
      return { success: false, error: 'Quick action not found' };
    }

    const result = await Roadmap.findByIdAndUpdate(
      roadmap._id,
      {
        $pull: { quickActions: { _id: actionId } }
      },
      { new: true }
    );

    if (!result) {
      return { success: false, error: 'Quick action not found' };
    }

    revalidatePath('/admin/roadmap');
    return {
      success: true,
      message: 'Quick action deleted successfully'
    };
  } catch (error: any) {
    console.error('Error deleting quick action:', error);
    return {
      success: false,
      error: error.message || 'Failed to delete quick action'
    };
  }
}