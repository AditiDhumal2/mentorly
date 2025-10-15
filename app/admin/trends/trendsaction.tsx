'use server';

import { revalidatePath } from 'next/cache';

// Types for our data
export interface TrendingSkill {
  id: string;
  skill: string;
  demandScore: number;
}

export interface HiringDomain {
  id: string;
  domain: string;
  openings: number;
}

export interface SalaryComparison {
  id: string;
  role: string;
  india: number;
  abroad: number;
}

export interface HotArticle {
  id: string;
  title: string;
  url: string;
  summary: string;
}

export interface TrendsData {
  month: string;
  updatedAt: string;
  apiSource: string;
  trendingSkills: TrendingSkill[];
  hiringDomains: HiringDomain[];
  salaryComparison: SalaryComparison[];
  hotArticles: HotArticle[];
}

// Mock database (in real app, use actual database)
let trendsData: TrendsData = {
  month: 'January 2024',
  updatedAt: new Date().toISOString(),
  apiSource: 'Industry Reports & Platform Analytics',
  trendingSkills: [
    { id: '1', skill: 'Artificial Intelligence', demandScore: 95 },
    { id: '2', skill: 'Cloud Computing', demandScore: 88 },
    { id: '3', skill: 'Cybersecurity', demandScore: 85 },
  ],
  hiringDomains: [
    { id: '1', domain: 'Software Development', openings: 12500 },
    { id: '2', domain: 'Data Analytics', openings: 8900 },
    { id: '3', domain: 'Cloud Engineering', openings: 7600 },
  ],
  salaryComparison: [
    { id: '1', role: 'Software Engineer', india: 12, abroad: 85 },
    { id: '2', role: 'Data Scientist', india: 15, abroad: 95 },
    { id: '3', role: 'DevOps Engineer', india: 14, abroad: 105 },
  ],
  hotArticles: [
    { 
      id: '1',
      title: 'The Rise of AI in Software Development', 
      url: '#',
      summary: 'How AI tools are transforming the development lifecycle'
    },
  ]
};

// Server action to get trends data
export async function getTrendsData(): Promise<TrendsData> {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    return trendsData;
  } catch (error) {
    console.error('Error fetching trends data:', error);
    throw new Error('Failed to fetch trends data');
  }
}

// Server action to update trends data
export async function updateTrendsData(updatedData: TrendsData): Promise<{ success: boolean; message: string }> {
  try {
    // Validate data
    if (!updatedData.month || !updatedData.apiSource) {
      return { success: false, message: 'Missing required fields' };
    }

    // Update the data
    trendsData = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    // Revalidate the market trends page to show fresh data
    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return { success: true, message: 'Trends data updated successfully!' };
  } catch (error) {
    console.error('Error updating trends data:', error);
    return { success: false, message: 'Failed to update trends data' };
  }
}

// Individual update functions for better granular control
export async function updateTrendingSkills(skills: TrendingSkill[]): Promise<{ success: boolean; message: string }> {
  try {
    trendsData.trendingSkills = skills;
    trendsData.updatedAt = new Date().toISOString();
    
    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { success: true, message: 'Trending skills updated successfully!' };
  } catch (error) {
    console.error('Error updating trending skills:', error);
    return { success: false, message: 'Failed to update trending skills' };
  }
}

export async function updateHiringDomains(domains: HiringDomain[]): Promise<{ success: boolean; message: string }> {
  try {
    trendsData.hiringDomains = domains;
    trendsData.updatedAt = new Date().toISOString();
    
    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { success: true, message: 'Hiring domains updated successfully!' };
  } catch (error) {
    console.error('Error updating hiring domains:', error);
    return { success: false, message: 'Failed to update hiring domains' };
  }
}

export async function updateSalaryComparison(salaries: SalaryComparison[]): Promise<{ success: boolean; message: string }> {
  try {
    trendsData.salaryComparison = salaries;
    trendsData.updatedAt = new Date().toISOString();
    
    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { success: true, message: 'Salary data updated successfully!' };
  } catch (error) {
    console.error('Error updating salary data:', error);
    return { success: false, message: 'Failed to update salary data' };
  }
}

export async function updateHotArticles(articles: HotArticle[]): Promise<{ success: boolean; message: string }> {
  try {
    trendsData.hotArticles = articles;
    trendsData.updatedAt = new Date().toISOString();
    
    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { success: true, message: 'Hot articles updated successfully!' };
  } catch (error) {
    console.error('Error updating hot articles:', error);
    return { success: false, message: 'Failed to update hot articles' };
  }
}