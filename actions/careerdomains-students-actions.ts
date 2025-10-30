// actions/career-domain-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { CareerDomain } from '@/models/CareerDomain';
import { revalidatePath } from 'next/cache';
import { ICareerDomain, ServerActionResponse } from '@/types/careerDomains';

// Get all career domains for students
export async function getCareerDomains(searchQuery: string = ''): Promise<ICareerDomain[]> {
  try {
    await connectDB();
    
    let query = {};
    
    if (searchQuery) {
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: 'i' } },
          { description: { $regex: searchQuery, $options: 'i' } },
          { skills: { $in: [new RegExp(searchQuery, 'i')] } }
        ]
      };
    }

    const domains = await CareerDomain.find(query).sort({ name: 1 });
    return JSON.parse(JSON.stringify(domains));
  } catch (error) {
    console.error('Error fetching career domains:', error);
    return [];
  }
}

// Get single career domain by name (used as slug)
export async function getCareerDomainBySlug(slug: string): Promise<ICareerDomain | null> {
  try {
    await connectDB();
    const domain = await CareerDomain.findOne({ 
      name: { $regex: new RegExp(`^${slug}$`, 'i') } 
    });
    return domain ? JSON.parse(JSON.stringify(domain)) : null;
  } catch (error) {
    console.error('Error fetching career domain:', error);
    return null;
  }
}

// Admin: Create new career domain
export async function createCareerDomain(formData: FormData): Promise<ServerActionResponse> {
  try {
    await connectDB();
    
    const domainData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      skills: (formData.get('skills') as string).split(',').map(skill => skill.trim()).filter(skill => skill),
      tools: (formData.get('tools') as string).split(',').map(tool => tool.trim()).filter(tool => tool),
      projects: (formData.get('projects') as string).split(',').map(project => project.trim()).filter(project => project),
      roles: (formData.get('roles') as string).split(',').map(role => role.trim()).filter(role => role),
      averageSalary: {
        india: formData.get('salaryIndia') as string,
        abroad: formData.get('salaryAbroad') as string
      },
      resources: [],
      relatedDomains: (formData.get('relatedDomains') as string)?.split(',').map(domain => domain.trim()).filter(domain => domain) || []
    };

    const newDomain = await CareerDomain.create(domainData);
    revalidatePath('/students/careerdomains');
    revalidatePath('/admin/career-domains');
    return { 
      success: true, 
      domain: JSON.parse(JSON.stringify(newDomain)) 
    };
  } catch (error: any) {
    console.error('Error creating career domain:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Admin: Update career domain
export async function updateCareerDomain(id: string, formData: FormData): Promise<ServerActionResponse> {
  try {
    await connectDB();
    
    const updateData = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      skills: (formData.get('skills') as string).split(',').map(skill => skill.trim()).filter(skill => skill),
      tools: (formData.get('tools') as string).split(',').map(tool => tool.trim()).filter(tool => tool),
      projects: (formData.get('projects') as string).split(',').map(project => project.trim()).filter(project => project),
      roles: (formData.get('roles') as string).split(',').map(role => role.trim()).filter(role => role),
      averageSalary: {
        india: formData.get('salaryIndia') as string,
        abroad: formData.get('salaryAbroad') as string
      },
      relatedDomains: (formData.get('relatedDomains') as string)?.split(',').map(domain => domain.trim()).filter(domain => domain) || [],
      lastUpdated: new Date()
    };

    const updatedDomain = await CareerDomain.findByIdAndUpdate(id, updateData, { new: true });
    revalidatePath('/students/careerdomains');
    revalidatePath('/admin/career-domains');
    return { 
      success: true, 
      domain: JSON.parse(JSON.stringify(updatedDomain)) 
    };
  } catch (error: any) {
    console.error('Error updating career domain:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Admin: Delete career domain
export async function deleteCareerDomain(id: string): Promise<ServerActionResponse> {
  try {
    await connectDB();
    await CareerDomain.findByIdAndDelete(id);
    revalidatePath('/students/careerdomains');
    revalidatePath('/admin/career-domains');
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting career domain:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Admin: Get domain by ID for editing
export async function getCareerDomainById(id: string): Promise<ICareerDomain | null> {
  try {
    await connectDB();
    const domain = await CareerDomain.findById(id);
    return domain ? JSON.parse(JSON.stringify(domain)) : null;
  } catch (error) {
    console.error('Error fetching career domain by ID:', error);
    return null;
  }
}