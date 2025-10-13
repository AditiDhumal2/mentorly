'use server';

import { connectDB } from '@/lib/db'; 
import MarketTrends, { IMarketTrends } from '@/models/MarketTrend';
import { revalidatePath } from 'next/cache';

// Get latest market trends
export async function getLatestMarketTrends() {
  try {
    await connectDB(); 
    
    const trends = await MarketTrends.findOne()
      .sort({ createdAt: -1 })
      .lean();

    return trends ? JSON.parse(JSON.stringify(trends)) : null;
  } catch (error) {
    console.error('Error fetching market trends:', error);
    return null;
  }
}

// Get market trends by month
export async function getMarketTrendsByMonth(month: string) {
  try {
    await connectDB(); 
    
    const trends = await MarketTrends.findOne({ month })
      .lean();

    return trends ? JSON.parse(JSON.stringify(trends)) : null;
  } catch (error) {
    console.error('Error fetching market trends by month:', error);
    return null;
  }
}

// Admin: Create new market trends
export async function createMarketTrends(data: {
  month: string;
  trendingSkills: { skill: string; demandScore: number }[];
  hiringDomains: { domain: string; openings: number }[];
  salaryComparison: { role: string; india: number; abroad: number }[];
  hotArticles: { title: string; url: string; summary?: string }[];
  apiSource: string;
}) {
  try {
    await connectDB(); 

    const newTrends = await MarketTrends.create({
      ...data,
      internalAnalytics: {
        mostCompletedSkills: [],
        popularResources: []
      }
    });

    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(newTrends)) 
    };
  } catch (error) {
    console.error('Error creating market trends:', error);
    return { 
      success: false, 
      error: 'Failed to create market trends' 
    };
  }
}

// Admin: Update market trends
export async function updateMarketTrends(
  id: string, 
  data: Partial<IMarketTrends>
) {
  try {
    await connectDB(); 

    const updatedTrends = await MarketTrends.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true }
    );

    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(updatedTrends)) 
    };
  } catch (error) {
    console.error('Error updating market trends:', error);
    return { 
      success: false, 
      error: 'Failed to update market trends' 
    };
  }
}

// Admin: Delete market trends
export async function deleteMarketTrends(id: string) {
  try {
    await connectDB(); // Changed from connectToDatabase

    await MarketTrends.findByIdAndDelete(id);

    revalidatePath('/market-trends');
    revalidatePath('/admin/trends');
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting market trends:', error);
    return { 
      success: false, 
      error: 'Failed to delete market trends' 
    };
  }
}

// Get all market trends for admin
export async function getAllMarketTrends() {
  try {
    await connectDB(); // Changed from connectToDatabase
    
    const trends = await MarketTrends.find()
      .sort({ createdAt: -1 })
      .lean();

    return JSON.parse(JSON.stringify(trends));
  } catch (error) {
    console.error('Error fetching all market trends:', error);
    return [];
  }
}

// Simulate API data fetch (would integrate with real APIs)
export async function fetchExternalMarketData() {
  try {
    // Simulate API calls to various sources
    const mockData = {
      trendingSkills: [
        { skill: "Artificial Intelligence", demandScore: 95 },
        { skill: "Cloud Computing", demandScore: 90 },
        { skill: "Cybersecurity", demandScore: 88 },
        { skill: "Machine Learning", demandScore: 92 },
        { skill: "DevOps", demandScore: 85 },
        { skill: "Data Science", demandScore: 87 },
        { skill: "Blockchain", demandScore: 82 },
        { skill: "IoT", demandScore: 80 }
      ],
      hiringDomains: [
        { domain: "Machine Learning Engineer", openings: 12500 },
        { domain: "Cloud Architect", openings: 9800 },
        { domain: "Data Scientist", openings: 11500 },
        { domain: "DevOps Engineer", openings: 10500 },
        { domain: "Full Stack Developer", openings: 15000 },
        { domain: "Cybersecurity Analyst", openings: 9200 }
      ],
      salaryComparison: [
        { role: "ML Engineer", india: 18, abroad: 150 },
        { role: "Full Stack Developer", india: 12, abroad: 110 },
        { role: "Data Scientist", india: 15, abroad: 130 },
        { role: "Cloud Engineer", india: 14, abroad: 125 },
        { role: "DevOps Engineer", india: 16, abroad: 140 }
      ],
      hotArticles: [
        {
          title: "AI Revolution: How Machine Learning is Transforming Industries",
          url: "https://example.com/ai-revolution",
          summary: "Exploring the impact of AI across various sectors and future trends."
        },
        {
          title: "Remote Work: The New Normal in Tech Industry",
          url: "https://example.com/remote-work-trends",
          summary: "How remote work is shaping hiring practices and team collaboration."
        },
        {
          title: "The Rise of Edge Computing in 2024",
          url: "https://example.com/edge-computing-rise",
          summary: "Understanding edge computing and its growing importance in tech infrastructure."
        }
      ]
    };

    return { success: true, data: mockData };
  } catch (error) {
    console.error('Error fetching external market data:', error);
    return { success: false, error: 'Failed to fetch external data' };
  }
}