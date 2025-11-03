// actions/professionalbranding-admin-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { BrandingChecklist } from '@/models/BrandingChecklist';
import { getCurrentUser } from '@/actions/userActions';
import { revalidatePath } from 'next/cache';
import { BrandingFormData, AdminChecklistsResponse } from '@/types/professionalBranding';

export async function getAdminBrandingChecklists(): Promise<AdminChecklistsResponse> {
  try {
    console.log('🔍 getAdminBrandingChecklists - Starting...');
    
    const user = await getCurrentUser();
    
    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Access denied' };
    }

    await connectDB();

    const checklists = await BrandingChecklist.find().sort({ year: 1 }).lean();

    console.log('✅ getAdminBrandingChecklists - Success:', {
      count: checklists.length
    });

    const formattedChecklists = checklists.map(checklist => ({
      ...checklist,
      _id: checklist._id.toString(),
      tasks: checklist.tasks.map((task: any) => ({
        ...task,
        _id: task._id.toString()
      })),
      createdAt: checklist.createdAt,
      updatedAt: checklist.updatedAt
    }));

    return {
      success: true,
      checklists: formattedChecklists
    };
  } catch (error) {
    console.error('❌ getAdminBrandingChecklists - Error:', error);
    return { success: false, error: 'Failed to fetch checklists' };
  }
}

export async function getBrandingChecklistByYear(year: number) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Access denied' };
    }

    await connectDB();

    const checklist = await BrandingChecklist.findOne({ year }).lean();

    if (!checklist) {
      return { success: false, error: 'Checklist not found' };
    }

    return {
      success: true,
      checklist: {
        ...checklist,
        _id: checklist._id.toString(),
        tasks: checklist.tasks.map((task: any) => ({
          ...task,
          _id: task._id.toString()
        })),
        createdAt: checklist.createdAt,
        updatedAt: checklist.updatedAt
      }
    };
  } catch (error) {
    console.error('❌ getBrandingChecklistByYear - Error:', error);
    return { success: false, error: 'Failed to fetch checklist' };
  }
}

export async function createBrandingChecklist(data: BrandingFormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Access denied' };
    }

    await connectDB();

    // Check if checklist already exists for this year
    const existingChecklist = await BrandingChecklist.findOne({ year: data.year });
    if (existingChecklist) {
      return { success: false, error: 'Checklist already exists for this year' };
    }

    const checklist = new BrandingChecklist(data);
    await checklist.save();

    console.log('✅ createBrandingChecklist - Success:', {
      year: data.year,
      tasks: data.tasks.length
    });

    revalidatePath('/admin/professionalbranding');

    return { success: true };
  } catch (error) {
    console.error('❌ createBrandingChecklist - Error:', error);
    return { success: false, error: 'Failed to create checklist' };
  }
}

export async function updateBrandingChecklist(year: number, data: BrandingFormData) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Access denied' };
    }

    await connectDB();

    const checklist = await BrandingChecklist.findOneAndUpdate(
      { year },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!checklist) {
      return { success: false, error: 'Checklist not found' };
    }

    console.log('✅ updateBrandingChecklist - Success:', {
      year,
      tasks: data.tasks.length
    });

    revalidatePath('/admin/professionalbranding');

    return { success: true };
  } catch (error) {
    console.error('❌ updateBrandingChecklist - Error:', error);
    return { success: false, error: 'Failed to update checklist' };
  }
}

export async function deleteBrandingChecklist(year: number) {
  try {
    const user = await getCurrentUser();
    
    if (!user || (user.role !== 'admin' && user.role !== 'mentor')) {
      return { success: false, error: 'Access denied' };
    }

    await connectDB();

    const result = await BrandingChecklist.findOneAndDelete({ year });

    if (!result) {
      return { success: false, error: 'Checklist not found' };
    }

    console.log('✅ deleteBrandingChecklist - Success:', { year });

    revalidatePath('/admin/professionalbranding');

    return { success: true };
  } catch (error) {
    console.error('❌ deleteBrandingChecklist - Error:', error);
    return { success: false, error: 'Failed to delete checklist' };
  }
}