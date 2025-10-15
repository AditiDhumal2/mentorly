'use server';

import { connectDB } from '@/lib/db';
import { Roadmap, IRoadmap } from '@/models/Roadmap';
import { CareerDomain, ICareerDomain } from '@/models/CareerDomain';
import { MarketTrend, IMarketTrend } from '@/models/MarketTrend';
import { Resource, IResource } from '@/models/Resource';
import { User, IUser } from '@/models/Students';

// Types for our admin operations
export type { IRoadmap, ICareerDomain, IMarketTrend, IResource, IUser };

export type RoadmapStep = IRoadmap['steps'][0];

// Helper type for lean documents
type LeanDocument<T> = Omit<T, keyof Document> & { _id: string };

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

// Roadmap Admin Actions
export async function getRoadmaps(): Promise<IRoadmap[]> {
  try {
    await connectDB();
    const roadmaps = await Roadmap.find().sort({ year: 1 }).lean();
    return roadmaps as unknown as IRoadmap[];
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
    return savedRoadmap.toObject() as IRoadmap;
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
    const domains = await CareerDomain.find().sort({ name: 1 }).lean();
    return domains as unknown as ICareerDomain[];
  } catch (error) {
    console.error('Error fetching career domains:', error);
    throw new Error('Failed to fetch career domains');
  }
}

export async function createCareerDomain(domainData: Omit<ICareerDomain, '_id' | 'lastUpdated'>): Promise<ICareerDomain> {
  try {
    await connectDB();
    const domain = new CareerDomain(domainData);
    const savedDomain = await domain.save();
    return savedDomain.toObject() as ICareerDomain;
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
    const trends = await MarketTrend.find().sort({ createdAt: -1 }).lean();
    return trends as unknown as IMarketTrend[];
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
      .lean();
    return resources as unknown as IResource[];
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
    return savedResource.toObject() as IResource;
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
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();
    return users as unknown as IUser[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw new Error('Failed to fetch users');
  }
}

export async function updateUserRole(id: string, role: 'student' | 'mentor' | 'admin'): Promise<void> {
  try {
    await connectDB();
    await User.findByIdAndUpdate(id, { role });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw new Error('Failed to update user role');
  }
}

export async function getUserById(id: string): Promise<IUser | null> {
  try {
    await connectDB();
    const user = await User.findById(id).select('-password').lean();
    return user as unknown as IUser | null;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await connectDB();
    await User.findByIdAndDelete(id);
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
      User.countDocuments(),
      Roadmap.countDocuments(),
      CareerDomain.countDocuments(),
      Resource.countDocuments(),
      User.find()
        .select('name email role createdAt')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    // Properly type the recent users
    const typedRecentUsers = recentUsers.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
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
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ 
        'learningStats.lastActive': { 
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
        } 
      }),
      User.aggregate([
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
    
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { college: { $regex: query, $options: 'i' } }
      ]
    })
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

    return users as unknown as IUser[];
  } catch (error) {
    console.error('Error searching users:', error);
    throw new Error('Failed to search users');
  }
}

export async function bulkUpdateUserRoles(userIds: string[], role: 'student' | 'mentor' | 'admin'): Promise<void> {
  try {
    await connectDB();
    
    await User.updateMany(
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
        data = await User.find().select('-password').lean();
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