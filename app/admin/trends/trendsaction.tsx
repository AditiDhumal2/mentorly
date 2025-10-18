"use server";

import { MarketTrendsData, TrendingSkill, HiringDomain, SalaryComparison, HotArticle, ApiResponse } from '@/lib/trends-types';

// In-memory database (replace with real database in production)
let marketTrendsData: MarketTrendsData = {
  id: '1',
  month: 'December 2024',
  updatedAt: new Date().toISOString(),
  apiSource: 'LinkedIn Jobs API & Industry Reports',
  trendingSkills: [
    { id: '1', skill: 'AI/ML Engineering', demandScore: 95 },
    { id: '2', skill: 'Cloud Architecture', demandScore: 88 },
    { id: '3', skill: 'Cybersecurity', demandScore: 85 },
    { id: '4', skill: 'Data Science', demandScore: 82 },
    { id: '5', skill: 'DevOps', demandScore: 80 },
    { id: '6', skill: 'Full Stack Development', demandScore: 78 },
  ],
  hiringDomains: [
    { id: '1', domain: 'Artificial Intelligence', openings: 12500 },
    { id: '2', domain: 'Cloud Computing', openings: 9800 },
    { id: '3', domain: 'FinTech', openings: 8700 },
    { id: '4', domain: 'Healthcare Tech', openings: 7600 },
    { id: '5', domain: 'E-commerce', openings: 6900 },
  ],
  salaryComparison: [
    { id: '1', role: 'Software Engineer', india: 12, abroad: 120 },
    { id: '2', role: 'Data Scientist', india: 15, abroad: 140 },
    { id: '3', role: 'DevOps Engineer', india: 14, abroad: 130 },
    { id: '4', role: 'Product Manager', india: 18, abroad: 150 },
  ],
  hotArticles: [
    {
      id: '1',
      title: 'The Rise of AI in Software Development',
      summary: 'How AI tools are transforming the software development lifecycle and creating new opportunities.',
      url: '#'
    },
    {
      id: '2',
      title: 'Remote Work: The New Normal in Tech',
      summary: 'Exploring how remote work is reshaping hiring practices and salary structures globally.',
      url: '#'
    }
  ]
};

// Get all trends data
export async function getTrendsData(): Promise<MarketTrendsData> {
  console.log('📊 Fetching trends data...');
  // Simulate async operation and return a copy
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(marketTrendsData)));
    }, 100);
  });
}

// Update all trends data
export async function updateTrendsData(updatedData: MarketTrendsData): Promise<ApiResponse> {
  console.log('💾 Updating all trends data...');
  try {
    marketTrendsData = {
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };
    console.log('✅ All data updated successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error updating data:', error);
    return { success: false, error: 'Failed to update trends data' };
  }
}

// Trending Skills CRUD
export async function addTrendingSkill(skill: Omit<TrendingSkill, 'id'>): Promise<ApiResponse> {
  console.log('➕ Adding new skill:', skill);
  try {
    const newSkill: TrendingSkill = {
      ...skill,
      id: Date.now().toString(),
    };
    
    marketTrendsData.trendingSkills.push(newSkill);
    marketTrendsData.updatedAt = new Date().toISOString();
    
    console.log('✅ Skill added successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error adding skill:', error);
    return { success: false, error: 'Failed to add skill' };
  }
}

export async function updateTrendingSkill(id: string, updates: Partial<TrendingSkill>): Promise<ApiResponse> {
  console.log('✏️ Updating skill:', id, updates);
  try {
    const skillIndex = marketTrendsData.trendingSkills.findIndex(skill => skill.id === id);
    if (skillIndex !== -1) {
      marketTrendsData.trendingSkills[skillIndex] = {
        ...marketTrendsData.trendingSkills[skillIndex],
        ...updates,
      };
      marketTrendsData.updatedAt = new Date().toISOString();
      console.log('✅ Skill updated successfully');
    } else {
      console.warn('⚠️ Skill not found:', id);
    }
    
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error updating skill:', error);
    return { success: false, error: 'Failed to update skill' };
  }
}

export async function deleteTrendingSkill(id: string): Promise<ApiResponse> {
  console.log('🗑️ Deleting skill:', id);
  try {
    marketTrendsData.trendingSkills = marketTrendsData.trendingSkills.filter(skill => skill.id !== id);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Skill deleted successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error deleting skill:', error);
    return { success: false, error: 'Failed to delete skill' };
  }
}

// Hiring Domains CRUD
export async function addHiringDomain(domain: Omit<HiringDomain, 'id'>): Promise<ApiResponse> {
  console.log('➕ Adding new domain:', domain);
  try {
    const newDomain: HiringDomain = {
      ...domain,
      id: Date.now().toString(),
    };
    
    marketTrendsData.hiringDomains.push(newDomain);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Domain added successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error adding domain:', error);
    return { success: false, error: 'Failed to add domain' };
  }
}

export async function updateHiringDomain(id: string, updates: Partial<HiringDomain>): Promise<ApiResponse> {
  console.log('✏️ Updating domain:', id, updates);
  try {
    const domainIndex = marketTrendsData.hiringDomains.findIndex(domain => domain.id === id);
    if (domainIndex !== -1) {
      marketTrendsData.hiringDomains[domainIndex] = {
        ...marketTrendsData.hiringDomains[domainIndex],
        ...updates,
      };
      marketTrendsData.updatedAt = new Date().toISOString();
      console.log('✅ Domain updated successfully');
    }
    
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error updating domain:', error);
    return { success: false, error: 'Failed to update domain' };
  }
}

export async function deleteHiringDomain(id: string): Promise<ApiResponse> {
  console.log('🗑️ Deleting domain:', id);
  try {
    marketTrendsData.hiringDomains = marketTrendsData.hiringDomains.filter(domain => domain.id !== id);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Domain deleted successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error deleting domain:', error);
    return { success: false, error: 'Failed to delete domain' };
  }
}

// Salary Comparison CRUD
export async function addSalaryComparison(salary: Omit<SalaryComparison, 'id'>): Promise<ApiResponse> {
  console.log('➕ Adding new salary:', salary);
  try {
    const newSalary: SalaryComparison = {
      ...salary,
      id: Date.now().toString(),
    };
    
    marketTrendsData.salaryComparison.push(newSalary);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Salary added successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error adding salary:', error);
    return { success: false, error: 'Failed to add salary' };
  }
}

export async function updateSalaryComparison(id: string, updates: Partial<SalaryComparison>): Promise<ApiResponse> {
  console.log('✏️ Updating salary:', id, updates);
  try {
    const salaryIndex = marketTrendsData.salaryComparison.findIndex(salary => salary.id === id);
    if (salaryIndex !== -1) {
      marketTrendsData.salaryComparison[salaryIndex] = {
        ...marketTrendsData.salaryComparison[salaryIndex],
        ...updates,
      };
      marketTrendsData.updatedAt = new Date().toISOString();
      console.log('✅ Salary updated successfully');
    }
    
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error updating salary:', error);
    return { success: false, error: 'Failed to update salary' };
  }
}

export async function deleteSalaryComparison(id: string): Promise<ApiResponse> {
  console.log('🗑️ Deleting salary:', id);
  try {
    marketTrendsData.salaryComparison = marketTrendsData.salaryComparison.filter(salary => salary.id !== id);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Salary deleted successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error deleting salary:', error);
    return { success: false, error: 'Failed to delete salary' };
  }
}

// Hot Articles CRUD
export async function addHotArticle(article: Omit<HotArticle, 'id'>): Promise<ApiResponse> {
  console.log('➕ Adding new article:', article);
  try {
    const newArticle: HotArticle = {
      ...article,
      id: Date.now().toString(),
    };
    
    marketTrendsData.hotArticles.push(newArticle);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Article added successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error adding article:', error);
    return { success: false, error: 'Failed to add article' };
  }
}

export async function updateHotArticle(id: string, updates: Partial<HotArticle>): Promise<ApiResponse> {
  console.log('✏️ Updating article:', id, updates);
  try {
    const articleIndex = marketTrendsData.hotArticles.findIndex(article => article.id === id);
    if (articleIndex !== -1) {
      marketTrendsData.hotArticles[articleIndex] = {
        ...marketTrendsData.hotArticles[articleIndex],
        ...updates,
      };
      marketTrendsData.updatedAt = new Date().toISOString();
      console.log('✅ Article updated successfully');
    }
    
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error updating article:', error);
    return { success: false, error: 'Failed to update article' };
  }
}

export async function deleteHotArticle(id: string): Promise<ApiResponse> {
  console.log('🗑️ Deleting article:', id);
  try {
    marketTrendsData.hotArticles = marketTrendsData.hotArticles.filter(article => article.id !== id);
    marketTrendsData.updatedAt = new Date().toISOString();
    console.log('✅ Article deleted successfully');
    return { success: true, data: marketTrendsData };
  } catch (error) {
    console.error('❌ Error deleting article:', error);
    return { success: false, error: 'Failed to delete article' };
  }
}