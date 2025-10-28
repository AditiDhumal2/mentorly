// app/actions/careerDomains.ts
'use server';

import { connectDB } from '@/lib/db';
import CareerDomain from '@/models/CareerDomain';
import { revalidatePath } from 'next/cache';

export async function getAllCareerDomains() {
  try {
    await connectDB();
    
    const domains = await CareerDomain.find({})
      .sort({ name: 1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(domains))
    };
  } catch (error) {
    console.error('Error fetching career domains:', error);
    return {
      success: false,
      error: 'Failed to fetch career domains'
    };
  }
}

export async function getCareerDomainByName(name: string) {
  try {
    await connectDB();
    
    const domain = await CareerDomain.findOne({ 
      name: { $regex: new RegExp(name, 'i') } 
    }).lean();
    
    if (!domain) {
      return {
        success: false,
        error: 'Career domain not found'
      };
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(domain))
    };
  } catch (error) {
    console.error('Error fetching career domain:', error);
    return {
      success: false,
      error: 'Failed to fetch career domain'
    };
  }
}

export async function searchCareerDomains(query: string) {
  try {
    await connectDB();
    
    const domains = await CareerDomain.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { skills: { $in: [new RegExp(query, 'i')] } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).sort({ name: 1 }).lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(domains))
    };
  } catch (error) {
    console.error('Error searching career domains:', error);
    return {
      success: false,
      error: 'Failed to search career domains'
    };
  }
}

export async function addToUserInterests(domainId: string, userId: string) {
  try {
    await connectDB();
    // This would update the user's interests in the users collection
    // Implementation depends on your user model structure
    revalidatePath('/career-domains');
    
    return {
      success: true,
      message: 'Added to interests successfully'
    };
  } catch (error) {
    console.error('Error adding to interests:', error);
    return {
      success: false,
      error: 'Failed to add to interests'
    };
  }
}