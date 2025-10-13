'use server';

import { connectDB } from '@/lib/db';
import { MarketTrend, IMarketTrend } from '@/models/MarketTrend';

export async function getLatestMarketTrends(): Promise<IMarketTrend | null> {
  try {
    await connectDB();
    const trends = await MarketTrend.findOne()
      .sort({ createdAt: -1 })
      .lean();
    return trends as IMarketTrend | null;
  } catch (error) {
    console.error('Error fetching market trends:', error);
    throw new Error('Failed to fetch market trends');
  }
}

export async function createMarketTrend(trendData: Omit<IMarketTrend, '_id' | 'createdAt' | 'updatedAt'>): Promise<IMarketTrend> {
  try {
    await connectDB();
    const trend = new MarketTrend(trendData);
    const savedTrend = await trend.save();
    return savedTrend.toObject() as IMarketTrend;
  } catch (error) {
    console.error('Error creating market trend:', error);
    throw new Error('Failed to create market trend');
  }
}