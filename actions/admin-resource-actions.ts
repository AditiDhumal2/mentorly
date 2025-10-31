'use server';

import { revalidatePath } from 'next/cache';
import { connectDB } from '../lib/db';
import Resource from '../models/Resource';
import { CreateResourceInput, UpdateResourceInput, ResourcesResponse, ResourceResponseSingle } from '@/types/resource';
import { Types } from 'mongoose';

export async function createResourceAction(formData: CreateResourceInput): Promise<ResourceResponseSingle> {
  try {
    await connectDB();

    const addedById = new Types.ObjectId();

    const resource = new Resource({
      ...formData,
      addedBy: addedById,
    });

    await resource.save();
    revalidatePath('/admin/resources');
    
    return { 
      success: true, 
      message: 'Resource created successfully', 
      resource: JSON.parse(JSON.stringify(resource))
    };
  } catch (error: any) {
    console.error('Error creating resource:', error);
    return { 
      success: false, 
      message: `Failed to create resource: ${error.message}` 
    };
  }
}

export async function updateResourceAction(resourceId: string, formData: UpdateResourceInput): Promise<ResourceResponseSingle> {
  try {
    await connectDB();

    const updatedResource = await Resource.findByIdAndUpdate(
      resourceId,
      { ...formData, updatedAt: new Date() },
      { new: true }
    );

    if (!updatedResource) {
      return { success: false, message: 'Resource not found' };
    }

    revalidatePath('/admin/resources');
    return { 
      success: true, 
      message: 'Resource updated successfully', 
      resource: JSON.parse(JSON.stringify(updatedResource))
    };
  } catch (error: any) {
    console.error('Error updating resource:', error);
    return { 
      success: false, 
      message: `Failed to update resource: ${error.message}` 
    };
  }
}

export async function deleteResourceAction(resourceId: string): Promise<{ success: boolean; message: string }> {
  try {
    await connectDB();

    const deletedResource = await Resource.findByIdAndDelete(resourceId);

    if (!deletedResource) {
      return { success: false, message: 'Resource not found' };
    }

    revalidatePath('/admin/resources');
    return { success: true, message: 'Resource deleted successfully' };
  } catch (error: any) {
    console.error('Error deleting resource:', error);
    return { success: false, message: `Failed to delete resource: ${error.message}` };
  }
}

export async function getAllResourcesAction(): Promise<ResourcesResponse> {
  try {
    await connectDB();

    // Get resources without populate
    const resources = await Resource.find().sort({ createdAt: -1 });

    return { 
      success: true, 
      resources: JSON.parse(JSON.stringify(resources)) 
    };
  } catch (error: any) {
    console.error('Error fetching resources:', error);
    return { 
      success: false, 
      message: `Failed to fetch resources: ${error.message}`, 
      resources: [] 
    };
  }
}