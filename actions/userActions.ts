'use server';

import { connectDB } from '@/lib/db';
import { User } from '@/models/User';

export async function getUserData(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('-password').lean();
    
    if (!user) {
      throw new Error('User not found');
    }

    // Simple type assertion to avoid TypeScript errors
    const userData = user as any;
    
    return {
      _id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      year: userData.year,
      college: userData.college,
      profiles: userData.profiles || {},
      interests: userData.interests || [],
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Failed to fetch user data');
  }
}

export async function getUserProgress(userId: string) {
  try {
    await connectDB();
    
    const user = await User.findById(userId).select('roadmapProgress brandingProgress savedResources year').lean();
    
    if (!user) {
      throw new Error('User not found');
    }

    // Simple type assertion
    const userData = user as any;

    // Simple progress calculation
    const completedRoadmapSteps = userData.roadmapProgress?.filter((p: any) => p.completed).length || 0;
    const completedBrandingTasks = userData.brandingProgress?.filter((p: any) => p.completed).length || 0;
    const savedResourcesCount = userData.savedResources?.length || 0;

    // Calculate percentages
    const roadmapProgress = Math.min(completedRoadmapSteps * 5, 100); // Simple percentage
    const brandingProgress = Math.min(completedBrandingTasks * 10, 100); // Simple percentage

    // Recent activity
    const recentActivity = [
      { type: 'account', title: 'Account Created', time: 'Just now' },
      { type: 'welcome', title: 'Welcome to CareerCompanion', time: 'Just now' },
    ];

    // Add actual progress activities if they exist
    if (completedRoadmapSteps > 0) {
      recentActivity.unshift({
        type: 'roadmap',
        title: `Completed ${completedRoadmapSteps} roadmap steps`,
        time: 'Recently'
      });
    }

    if (completedBrandingTasks > 0) {
      recentActivity.unshift({
        type: 'branding', 
        title: `Completed ${completedBrandingTasks} branding tasks`,
        time: 'Recently'
      });
    }

    return {
      roadmapProgress,
      brandingProgress,
      savedResources: savedResourcesCount,
      recentActivity: recentActivity.slice(0, 5), // Only show 5 most recent
    };
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return {
      roadmapProgress: 0,
      brandingProgress: 0,
      savedResources: 0,
      recentActivity: [
        { type: 'welcome', title: 'Welcome to CareerCompanion', time: 'Just now' },
      ],
    };
  }
}