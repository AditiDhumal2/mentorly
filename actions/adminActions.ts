// actions/adminActions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Roadmap } from '@/models/Roadmap';
import { CareerDomain } from '@/models/CareerDomain';
import { MarketTrend } from '@/models/MarketTrend';
import { Resource } from '@/models/Resource';
import { Student } from '@/models/Students';

// Define types locally since interfaces aren't exported from models
export interface IRoadmap {
  _id: string;
  title: string;
  description: string;
  year: number;
  domain: string;
  steps: Array<{
    title: string;
    description: string;
    resources: string[];
    completed: boolean;
    duration: string;
    order: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICareerDomain {
  _id: string;
  name: string;
  description: string;
  skills: string[];
  averageSalary: string;
  growth: string;
  trending: boolean;
  lastUpdated: Date;
}

export interface IMarketTrend {
  _id: string;
  title: string;
  description: string;
  category: string;
  impact: 'high' | 'medium' | 'low';
  source: string;
  date: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IResource {
  _id: string;
  title: string;
  description: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'book' | 'documentation';
  domain: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  free: boolean;
  rating: number;
  ratedBy: string[];
  addedBy: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'mentor' | 'admin';
  year: number;
  college: string;
  preferredLanguage: string;
  profiles: Record<string, any>;
  interests: string[];
  roadmapProgress: Array<{
    roadmapId: string;
    completedSteps: string[];
    currentStep: number;
    startedAt: Date;
    lastUpdated: Date;
  }>;
  learningStats: {
    totalTimeSpent: number;
    stepsCompleted: number;
    resourcesViewed: number;
    lastActive: Date;
    currentStreak: number;
    longestStreak: number;
    loginCount: number;
    averageEngagement: number;
    totalCodeSubmissions: number;
    totalProjectSubmissions: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export type RoadmapStep = IRoadmap['steps'][0];

// Types for dashboard stats
interface DashboardStats {
  totalUsers: number;
  totalRoadmaps: number;
  totalDomains: number;
  totalResources: number;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

// Helper type for MongoDB lean documents
type MongoDocument<T> = T & {
  _id: any;
  __v?: number;
};

// Roadmap Admin Actions
export async function getRoadmaps(): Promise<IRoadmap[]> {
  try {
    await connectDB();
    const roadmaps = await Roadmap.find().sort({ year: 1 }).lean() as MongoDocument<IRoadmap>[];
    
    return roadmaps.map(roadmap => ({
      _id: roadmap._id.toString(),
      title: roadmap.title,
      description: roadmap.description,
      year: roadmap.year,
      domain: roadmap.domain,
      steps: roadmap.steps,
      createdAt: new Date(roadmap.createdAt),
      updatedAt: new Date(roadmap.updatedAt)
    }));
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    throw new Error('Failed to fetch roadmaps');
  }
}

export async function createRoadmap(roadmapData: Omit<IRoadmap, '_id' | 'createdAt' | 'updatedAt'>): Promise<IRoadmap> {
  try {
    await connectDB();
    const roadmap = new Roadmap(roadmapData);
    const savedRoadmap = await roadmap.save();
    return {
      _id: savedRoadmap._id.toString(),
      title: savedRoadmap.title,
      description: savedRoadmap.description,
      year: savedRoadmap.year,
      domain: savedRoadmap.domain,
      steps: savedRoadmap.steps,
      createdAt: savedRoadmap.createdAt,
      updatedAt: savedRoadmap.updatedAt
    };
  } catch (error) {
    console.error('Error creating roadmap:', error);
    throw new Error('Failed to create roadmap');
  }
}

export async function updateRoadmap(id: string, roadmapData: Partial<IRoadmap>): Promise<void> {
  try {
    await connectDB();
    await Roadmap.findByIdAndUpdate(id, roadmapData);
  } catch (error) {
    console.error('Error updating roadmap:', error);
    throw new Error('Failed to update roadmap');
  }
}

export async function deleteRoadmap(id: string): Promise<void> {
  try {
    await connectDB();
    await Roadmap.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting roadmap:', error);
    throw new Error('Failed to delete roadmap');
  }
}

// Career Domains Admin Actions
export async function getCareerDomains(): Promise<ICareerDomain[]> {
  try {
    await connectDB();
    const domains = await CareerDomain.find().sort({ name: 1 }).lean() as MongoDocument<ICareerDomain>[];
    
    return domains.map(domain => ({
      _id: domain._id.toString(),
      name: domain.name,
      description: domain.description,
      skills: domain.skills,
      averageSalary: domain.averageSalary,
      growth: domain.growth,
      trending: domain.trending,
      lastUpdated: new Date(domain.lastUpdated)
    }));
  } catch (error) {
    console.error('Error fetching career domains:', error);
    throw new Error('Failed to fetch career domains');
  }
}

export async function createCareerDomain(domainData: Omit<ICareerDomain, '_id' | 'lastUpdated'>): Promise<ICareerDomain> {
  try {
    await connectDB();
    const domain = new CareerDomain({
      ...domainData,
      lastUpdated: new Date()
    });
    const savedDomain = await domain.save();
    return {
      _id: savedDomain._id.toString(),
      name: savedDomain.name,
      description: savedDomain.description,
      skills: savedDomain.skills,
      averageSalary: savedDomain.averageSalary,
      growth: savedDomain.growth,
      trending: savedDomain.trending,
      lastUpdated: savedDomain.lastUpdated
    };
  } catch (error) {
    console.error('Error creating career domain:', error);
    throw new Error('Failed to create career domain');
  }
}

export async function updateCareerDomain(id: string, domainData: Partial<ICareerDomain>): Promise<void> {
  try {
    await connectDB();
    await CareerDomain.findByIdAndUpdate(id, { 
      ...domainData, 
      lastUpdated: new Date() 
    });
  } catch (error) {
    console.error('Error updating career domain:', error);
    throw new Error('Failed to update career domain');
  }
}

export async function deleteCareerDomain(id: string): Promise<void> {
  try {
    await connectDB();
    await CareerDomain.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting career domain:', error);
    throw new Error('Failed to delete career domain');
  }
}

// Market Trends Admin Actions
export async function getMarketTrends(): Promise<IMarketTrend[]> {
  try {
    await connectDB();
    const trends = await MarketTrend.find().sort({ createdAt: -1 }).lean() as MongoDocument<IMarketTrend>[];
    
    return trends.map(trend => ({
      _id: trend._id.toString(),
      title: trend.title,
      description: trend.description,
      category: trend.category,
      impact: trend.impact,
      source: trend.source,
      date: new Date(trend.date),
      tags: trend.tags,
      createdAt: new Date(trend.createdAt),
      updatedAt: new Date(trend.updatedAt)
    }));
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
    return {
      _id: savedTrend._id.toString(),
      title: savedTrend.title,
      description: savedTrend.description,
      category: savedTrend.category,
      impact: savedTrend.impact,
      source: savedTrend.source,
      date: savedTrend.date,
      tags: savedTrend.tags,
      createdAt: savedTrend.createdAt,
      updatedAt: savedTrend.updatedAt
    };
  } catch (error) {
    console.error('Error creating market trend:', error);
    throw new Error('Failed to create market trend');
  }
}

export async function updateMarketTrend(id: string, trendData: Partial<IMarketTrend>): Promise<void> {
  try {
    await connectDB();
    await MarketTrend.findByIdAndUpdate(id, trendData);
  } catch (error) {
    console.error('Error updating market trend:', error);
    throw new Error('Failed to update market trend');
  }
}

export async function deleteMarketTrend(id: string): Promise<void> {
  try {
    await connectDB();
    await MarketTrend.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting market trend:', error);
    throw new Error('Failed to delete market trend');
  }
}

// Resources Admin Actions
export async function getResources(): Promise<IResource[]> {
  try {
    await connectDB();
    const resources = await Resource.find()
      .populate('addedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean() as MongoDocument<IResource>[];
    
    return resources.map(resource => ({
      _id: resource._id.toString(),
      title: resource.title,
      description: resource.description,
      url: resource.url,
      type: resource.type,
      domain: resource.domain,
      difficulty: resource.difficulty,
      free: resource.free,
      rating: resource.rating,
      ratedBy: resource.ratedBy,
      addedBy: resource.addedBy,
      tags: resource.tags,
      createdAt: new Date(resource.createdAt),
      updatedAt: new Date(resource.updatedAt)
    }));
  } catch (error) {
    console.error('Error fetching resources:', error);
    throw new Error('Failed to fetch resources');
  }
}

export async function createResource(resourceData: Omit<IResource, '_id' | 'ratedBy' | 'rating' | 'createdAt' | 'updatedAt'>): Promise<IResource> {
  try {
    await connectDB();
    const resource = new Resource({
      ...resourceData,
      rating: 0,
      ratedBy: []
    });
    const savedResource = await resource.save();
    return {
      _id: savedResource._id.toString(),
      title: savedResource.title,
      description: savedResource.description,
      url: savedResource.url,
      type: savedResource.type,
      domain: savedResource.domain,
      difficulty: savedResource.difficulty,
      free: savedResource.free,
      rating: savedResource.rating,
      ratedBy: savedResource.ratedBy,
      addedBy: savedResource.addedBy,
      tags: savedResource.tags,
      createdAt: savedResource.createdAt,
      updatedAt: savedResource.updatedAt
    };
  } catch (error) {
    console.error('Error creating resource:', error);
    throw new Error('Failed to create resource');
  }
}

export async function updateResource(id: string, resourceData: Partial<IResource>): Promise<void> {
  try {
    await connectDB();
    await Resource.findByIdAndUpdate(id, resourceData);
  } catch (error) {
    console.error('Error updating resource:', error);
    throw new Error('Failed to update resource');
  }
}

export async function deleteResource(id: string): Promise<void> {
  try {
    await connectDB();
    await Resource.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting resource:', error);
    throw new Error('Failed to delete resource');
  }
}

// Users Admin Actions
export async function getUsers(): Promise<IUser[]> {
  try {
    await connectDB();
    const users = await Student.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean() as MongoDocument<IUser>[];
    
    return users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: '', // Excluded from query
      role: user.role,
      year: user.year,
      college: user.college,
      preferredLanguage: user.preferredLanguage,
      profiles: user.profiles,
      interests: user.interests,
      roadmapProgress: user.roadmapProgress.map((progress: any) => ({
        roadmapId: progress.roadmapId,
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        startedAt: new Date(progress.startedAt),
        lastUpdated: new Date(progress.lastUpdated)
      })),
      learningStats: {
        totalTimeSpent: user.learningStats.totalTimeSpent,
        stepsCompleted: user.learningStats.stepsCompleted,
        resourcesViewed: user.learningStats.resourcesViewed,
        lastActive: new Date(user.learningStats.lastActive),
        currentStreak: user.learningStats.currentStreak,
        longestStreak: user.learningStats.longestStreak,
        loginCount: user.learningStats.loginCount,
        averageEngagement: user.learningStats.averageEngagement,
        totalCodeSubmissions: user.learningStats.totalCodeSubmissions,
        totalProjectSubmissions: user.learningStats.totalProjectSubmissions
      },
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function updateUserRole(id: string, role: 'student' | 'mentor' | 'admin'): Promise<void> {
  try {
    await connectDB();
    await Student.findByIdAndUpdate(id, { role });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function getUserById(id: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await Student.findById(id).select('-password').lean() as MongoDocument<IUser> | null;
    if (!user) return null;
    
    return {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: '', // Excluded from query
      role: user.role,
      year: user.year,
      college: user.college,
      preferredLanguage: user.preferredLanguage,
      profiles: user.profiles,
      interests: user.interests,
      roadmapProgress: user.roadmapProgress.map((progress: any) => ({
        roadmapId: progress.roadmapId,
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        startedAt: new Date(progress.startedAt),
        lastUpdated: new Date(progress.lastUpdated)
      })),
      learningStats: {
        totalTimeSpent: user.learningStats.totalTimeSpent,
        stepsCompleted: user.learningStats.stepsCompleted,
        resourcesViewed: user.learningStats.resourcesViewed,
        lastActive: new Date(user.learningStats.lastActive),
        currentStreak: user.learningStats.currentStreak,
        longestStreak: user.learningStats.longestStreak,
        loginCount: user.learningStats.loginCount,
        averageEngagement: user.learningStats.averageEngagement,
        totalCodeSubmissions: user.learningStats.totalCodeSubmissions,
        totalProjectSubmissions: user.learningStats.totalProjectSubmissions
      },
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await connectDB();
    await Student.findByIdAndDelete(id);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw new Error('Failed to delete user');
  }
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    await connectDB();
    
    const [
      totalUsers,
      totalRoadmaps,
      totalDomains,
      totalResources,
      recentUsers
    ] = await Promise.all([
      Student.countDocuments(),
      Roadmap.countDocuments(),
      CareerDomain.countDocuments(),
      Resource.countDocuments(),
      Student.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Properly type the recent users
    const typedRecentUsers = (recentUsers as any[]).map((user) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt.toISOString()
    }));

    return {
      totalUsers,
      totalRoadmaps,
      totalDomains,
      totalResources,
      recentUsers: typedRecentUsers
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw new Error('Failed to fetch dashboard stats');
  }
}

// Additional admin utility functions
export async function getPlatformStats() {
  try {
    await connectDB();
    
    const [
      totalStudents,
      totalMentors,
      totalAdmins,
      activeUsersThisWeek,
      totalCompletedSteps
    ] = await Promise.all([
      Student.countDocuments({ role: 'student' }),
      Student.countDocuments({ role: 'mentor' }),
      Student.countDocuments({ role: 'admin' }),
      Student.countDocuments({ 
        'learningStats.lastActive': { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      }),
      Student.aggregate([
        { $unwind: '$roadmapProgress' },
        { $match: { 'roadmapProgress.completed': true } },
        { $count: 'totalCompleted' }
      ])
    ]);

    return {
      totalStudents,
      totalMentors,
      totalAdmins,
      activeUsersThisWeek,
      totalCompletedSteps: totalCompletedSteps[0]?.totalCompleted || 0
    };
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    throw new Error('Failed to fetch platform stats');
  }
}

export async function searchUsers(query: string): Promise<IUser[]> {
  try {
    await connectDB();
    
    const users = await Student.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { college: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean() as MongoDocument<IUser>[];

    return users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      password: '', // Excluded from query
      role: user.role,
      year: user.year,
      college: user.college,
      preferredLanguage: user.preferredLanguage,
      profiles: user.profiles,
      interests: user.interests,
      roadmapProgress: user.roadmapProgress.map((progress: any) => ({
        roadmapId: progress.roadmapId,
        completedSteps: progress.completedSteps,
        currentStep: progress.currentStep,
        startedAt: new Date(progress.startedAt),
        lastUpdated: new Date(progress.lastUpdated)
      })),
      learningStats: {
        totalTimeSpent: user.learningStats.totalTimeSpent,
        stepsCompleted: user.learningStats.stepsCompleted,
        resourcesViewed: user.learningStats.resourcesViewed,
        lastActive: new Date(user.learningStats.lastActive),
        currentStreak: user.learningStats.currentStreak,
        longestStreak: user.learningStats.longestStreak,
        loginCount: user.learningStats.loginCount,
        averageEngagement: user.learningStats.averageEngagement,
        totalCodeSubmissions: user.learningStats.totalCodeSubmissions,
        totalProjectSubmissions: user.learningStats.totalProjectSubmissions
      },
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt)
    }));
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
}

export async function bulkUpdateUserRoles(userIds: string[], role: 'student' | 'mentor' | 'admin'): Promise<void> {
  try {
    await connectDB();
    
    await Student.updateMany(
      { _id: { $in: userIds } },
      { role }
    );
  } catch (error) {
    console.error('Error bulk updating user roles:', error);
    throw new Error('Failed to bulk update user roles');
  }
}

// Content management utilities
export async function getContentOverview() {
  try {
    await connectDB();
    
    const [
      publishedRoadmaps,
      draftRoadmaps,
      publishedDomains,
      activeResources,
      featuredResources
    ] = await Promise.all([
      Roadmap.countDocuments(),
      Roadmap.countDocuments({ status: 'draft' }),
      CareerDomain.countDocuments(),
      Resource.countDocuments({ free: true }),
      Resource.countDocuments({ rating: { $gte: 4 } })
    ]);

    return {
      publishedRoadmaps,
      draftRoadmaps,
      publishedDomains,
      activeResources,
      featuredResources
    };
  } catch (error) {
    console.error('Error fetching content overview:', error);
    throw new Error('Failed to fetch content overview');
  }
}

// System maintenance functions
export async function cleanupOrphanedData(): Promise<{ deletedCount: number }> {
  try {
    await connectDB();
    
    // Example: Clean up resources that don't have a valid addedBy user
    const result = await Resource.deleteMany({
      addedBy: { $exists: true },
      $or: [
        { addedBy: null },
        { addedBy: { $type: 'string' } } // Invalid ObjectId format
      ]
    });

    return { deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error cleaning up orphaned data:', error);
    throw new Error('Failed to clean up orphaned data');
  }
}

export async function exportData(collection: string): Promise<any[]> {
  try {
    await connectDB();
    
    let data;
    switch (collection) {
      case 'users':
        data = await Student.find().select('-password').lean();
        break;
      case 'roadmaps':
        data = await Roadmap.find().lean();
        break;
      case 'careerDomains':
        data = await CareerDomain.find().lean();
        break;
      case 'resources':
        data = await Resource.find().lean();
        break;
      case 'marketTrends':
        data = await MarketTrend.find().lean();
        break;
      default:
        throw new Error('Invalid collection specified');
    }

    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    throw new Error('Failed to export data');
  }
}