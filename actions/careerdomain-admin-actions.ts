'use server';

import { connectDB } from '@/lib/db';
import { CareerDomain } from '@/models/CareerDomain';
import { revalidatePath } from 'next/cache';
import { ICareerDomain, ServerActionResponse, BulkActionResponse, CareerDomainsStats } from '@/types/careerDomains';

// Admin: Create new career domain
export async function createCareerDomain(formData: FormData): Promise<ServerActionResponse> {
  try {
    await connectDB();
    
    // Add validation and debugging
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const skills = formData.get('skills') as string;

    console.log('Creating domain with:', { name, description, skills });

    if (!name?.trim() || !description?.trim() || !skills?.trim()) {
      return {
        success: false,
        error: 'Name, description, and skills are required fields'
      };
    }

    const domainData = {
      name: name.trim(),
      description: description.trim(),
      skills: skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      tools: (formData.get('tools') as string)?.split(',').map(tool => tool.trim()).filter(tool => tool) || [],
      projects: (formData.get('projects') as string)?.split(',').map(project => project.trim()).filter(project => project) || [],
      roles: (formData.get('roles') as string)?.split(',').map(role => role.trim()).filter(role => role) || [],
      averageSalary: {
        india: (formData.get('salaryIndia') as string) || '',
        abroad: (formData.get('salaryAbroad') as string) || ''
      },
      resources: [],
      relatedDomains: (formData.get('relatedDomains') as string)?.split(',').map(domain => domain.trim()).filter(domain => domain) || []
    };

    const newDomain = await CareerDomain.create(domainData);
    
    
    revalidatePath('/students/careerdomains');
    revalidatePath('/admin/careerdomains'); 
    
    console.log('Domain created successfully:', newDomain._id);
    
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
    revalidatePath('/admin/careerdomains'); 
    
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

export async function deleteCareerDomain(id: string): Promise<ServerActionResponse> {
  try {
    await connectDB();
    await CareerDomain.findByIdAndDelete(id);
    
    
    revalidatePath('/students/careerdomains');
    revalidatePath('/admin/careerdomains'); 
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting career domain:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}


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

export async function getAllCareerDomains(searchQuery: string = ''): Promise<ICareerDomain[]> {
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
    console.error('Error fetching career domains for admin:', error);
    return [];
  }
}

export async function bulkCreateCareerDomains(domainsData: any[]): Promise<BulkActionResponse> {
  try {
    await connectDB();

    const domainsToCreate = domainsData.map(domain => ({
      name: domain.name,
      description: domain.description,
      skills: domain.skills.split(',').map((skill: string) => skill.trim()).filter((skill: string) => skill),
      tools: domain.tools.split(',').map((tool: string) => tool.trim()).filter((tool: string) => tool),
      projects: domain.projects.split(',').map((project: string) => project.trim()).filter((project: string) => project),
      roles: domain.roles.split(',').map((role: string) => role.trim()).filter((role: string) => role),
      averageSalary: {
        india: domain.salaryIndia,
        abroad: domain.salaryAbroad
      },
      resources: [],
      relatedDomains: domain.relatedDomains.split(',').map((domain: string) => domain.trim()).filter((domain: string) => domain)
    }));

    const createdDomains = await CareerDomain.insertMany(domainsToCreate);
    
    revalidatePath('/students/careerdomains');
    revalidatePath('/admin/careerdomains'); 
    
    return { 
      success: true, 
      message: `Successfully created ${createdDomains.length} career domains`,
      domains: JSON.parse(JSON.stringify(createdDomains)),
      count: createdDomains.length
    };
  } catch (error: any) {
    console.error('Error bulk creating career domains:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

export async function getCareerDomainsStats(): Promise<CareerDomainsStats> {
  try {
    await connectDB();

    const domains = await CareerDomain.find({});
    
    const totalDomains = domains.length;
    const domainsWithSalary = domains.filter(domain => 
      domain.averageSalary?.india || domain.averageSalary?.abroad
    ).length;
    
    const totalSkills = domains.reduce((acc, domain) => acc + domain.skills.length, 0);
    const averageSkillsPerDomain = totalDomains > 0 ? Math.round(totalSkills / totalDomains) : 0;

    const allSkills = domains.flatMap(domain => domain.skills);
    const skillCounts: { [key: string]: number } = {};
    allSkills.forEach(skill => {
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    });

    const mostCommonSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([skill]) => skill);

    return {
      totalDomains,
      domainsWithSalary,
      averageSkillsPerDomain,
      mostCommonSkills
    };
  } catch (error) {
    console.error('Error fetching career domains stats:', error);
    return {
      totalDomains: 0,
      domainsWithSalary: 0,
      averageSkillsPerDomain: 0,
      mostCommonSkills: []
    };
  }
}