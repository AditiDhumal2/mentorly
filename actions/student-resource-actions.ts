'use server';

import { connectDB } from '../lib/db';
import Resource from '../models/Resource';
import { ResourcesResponse, ApiResponse } from '@/types/resource';

interface ResourceFilters {
  type?: string;
  tags?: string[];
  level?: string;
  free?: boolean;
}

export async function getResourcesAction(filters?: ResourceFilters): Promise<ResourcesResponse> {
  try {
    await connectDB();

    let query: any = {};

    if (filters?.type && filters.type !== 'all') {
      query.type = filters.type;
    }

    if (filters?.level && filters.level !== 'all') {
      query.level = filters.level;
    }

    if (filters?.free !== undefined) {
      query.free = filters.free;
    }

    if (filters?.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });

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

export async function saveResourceAction(userId: string, resourceId: string): Promise<ApiResponse<null>> {
  try {
  
    return { 
      success: true, 
      message: 'Resource saved successfully' 
    };
  } catch (error: any) {
    console.error('Error saving resource:', error);
    return { 
      success: false, 
      message: `Failed to save resource: ${error.message}` 
    };
  }
}

export async function getResourceTagsAction(): Promise<ApiResponse<string[]>> {
  try {
    await connectDB();

    const tags = await Resource.distinct('tags');
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(tags)) 
    };
  } catch (error: any) {
    console.error('Error fetching tags:', error);
    return { 
      success: false, 
      message: `Failed to fetch tags: ${error.message}`, 
      data: [] 
    };
  }
}