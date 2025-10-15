import { MarketTrend, type IMarketTrend } from '../models/MarketTrend';
import { connectDB } from '../lib/db';

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

// Convert database model to frontend format
function convertToFrontendFormat(dbData: IMarketTrend): TrendsData {
  return {
    month: dbData.month,
    updatedAt: dbData.updatedAt.toISOString(),
    apiSource: dbData.apiSource,
    trendingSkills: dbData.trendingSkills.map((skill, index) => ({
      id: skill._id?.toString() || `skill-${index}`,
      skill: skill.skill,
      demandScore: skill.demandScore
    })),
    hiringDomains: dbData.hiringDomains.map((domain, index) => ({
      id: domain._id?.toString() || `domain-${index}`,
      domain: domain.domain,
      openings: domain.openings
    })),
    salaryComparison: dbData.salaryComparison.map((salary, index) => ({
      id: salary._id?.toString() || `salary-${index}`,
      role: salary.role,
      india: salary.india,
      abroad: salary.abroad
    })),
    hotArticles: dbData.hotArticles.map((article, index) => ({
      id: article._id?.toString() || `article-${index}`,
      title: article.title,
      url: article.url,
      summary: article.summary || ''
    }))
  };
}

// Convert frontend format to database model
function convertToDatabaseFormat(frontendData: TrendsData): Partial<IMarketTrend> {
  return {
    month: frontendData.month,
    apiSource: frontendData.apiSource,
    trendingSkills: frontendData.trendingSkills.map(skill => ({
      skill: skill.skill,
      demandScore: skill.demandScore
    })),
    hiringDomains: frontendData.hiringDomains.map(domain => ({
      domain: domain.domain,
      openings: domain.openings
    })),
    salaryComparison: frontendData.salaryComparison.map(salary => ({
      role: salary.role,
      india: salary.india,
      abroad: salary.abroad
    })),
    hotArticles: frontendData.hotArticles.map(article => ({
      title: article.title,
      url: article.url,
      summary: article.summary
    }))
  };
}

export async function getTrendsData(): Promise<TrendsData> {
  try {
    await connectDB();
    
    // Get the latest market trends data
    const latestTrends = await MarketTrend.findOne()
      .sort({ createdAt: -1 }) // Get the most recent
      .exec();

    if (!latestTrends) {
      // Create default data if none exists
      const defaultData = new MarketTrend({
        month: 'January 2024',
        apiSource: 'Industry Reports & Platform Analytics',
        trendingSkills: [
          { skill: 'Artificial Intelligence', demandScore: 95 },
          { skill: 'Cloud Computing', demandScore: 88 },
          { skill: 'Cybersecurity', demandScore: 85 },
        ],
        hiringDomains: [
          { domain: 'Software Development', openings: 12500 },
          { domain: 'Data Analytics', openings: 8900 },
          { domain: 'Cloud Engineering', openings: 7600 },
        ],
        salaryComparison: [
          { role: 'Software Engineer', india: 12, abroad: 85 },
          { role: 'Data Scientist', india: 15, abroad: 95 },
          { role: 'DevOps Engineer', india: 14, abroad: 105 },
        ],
        hotArticles: [
          { 
            title: 'The Rise of AI in Software Development', 
            url: '#',
            summary: 'How AI tools are transforming the development lifecycle'
          },
        ]
      });
      
      await defaultData.save();
      return convertToFrontendFormat(defaultData);
    }

    return convertToFrontendFormat(latestTrends);
  } catch (error) {
    console.error('Error fetching trends data from DB:', error);
    throw new Error('Failed to fetch trends data from database');
  }
}

export async function updateTrendsData(newData: TrendsData): Promise<void> {
  try {
    await connectDB();
    
    // Get the latest document to update
    const latestTrends = await MarketTrend.findOne().sort({ createdAt: -1 }).exec();
    
    if (latestTrends) {
      // Update existing document
      const updateData = convertToDatabaseFormat(newData);
      await MarketTrend.findByIdAndUpdate(latestTrends._id, updateData);
    } else {
      // Create new document
      const marketTrend = new MarketTrend(convertToDatabaseFormat(newData));
      await marketTrend.save();
    }
  } catch (error) {
    console.error('Error updating trends data in DB:', error);
    throw new Error('Failed to update trends data in database');
  }
}