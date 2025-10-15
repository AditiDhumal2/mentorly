'use server';

import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students'; // Changed from User to Student
import { cookies } from 'next/headers';

export async function getCurrentUser() {
  try {
    console.log('🔍 getCurrentUser - Starting to fetch current user...');
    
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user-data');
    
    console.log('🔍 getCurrentUser - User cookie exists:', !!userCookie);
    console.log('🔍 getCurrentUser - All cookies:', Array.from(cookieStore.getAll()).map(c => c.name));
    
    if (!userCookie?.value) {
      console.log('❌ getCurrentUser - No user cookie found or cookie value is empty');
      return null;
    }

    console.log('🔍 getCurrentUser - Raw cookie value:', userCookie.value);

    let userData;
    try {
      userData = JSON.parse(userCookie.value);
      console.log('🔍 getCurrentUser - Parsed user data:', userData);
    } catch (parseError) {
      console.error('❌ getCurrentUser - Error parsing cookie JSON:', parseError);
      return null;
    }

    const userId = userData.id || userData._id;
    console.log('🔍 getCurrentUser - Extracted user ID:', userId);

    if (!userId) {
      console.log('❌ getCurrentUser - No user ID found in cookie data');
      return null;
    }

    console.log('🔍 getCurrentUser - Connecting to database...');
    await connectDB();
    
    console.log('🔍 getCurrentUser - Searching for user with ID:', userId);
    const user = await Student.findById(userId).select('-password').lean(); // Changed from User to Student
    
    if (!user) {
      console.log('❌ getCurrentUser - User not found in database for ID:', userId);
      return null;
    }

    console.log('🔍 getCurrentUser - Raw user data from DB:', user);

    // Simple type assertion
    const userDataFromDB = user as any;
    
    const formattedUser = {
      _id: userDataFromDB._id.toString(),
      name: userDataFromDB.name,
      email: userDataFromDB.email,
      role: userDataFromDB.role,
      year: userDataFromDB.year,
      college: userDataFromDB.college,
      profiles: userDataFromDB.profiles || {},
      interests: userDataFromDB.interests || [],
      createdAt: userDataFromDB.createdAt,
      updatedAt: userDataFromDB.updatedAt
    };

    console.log('✅ getCurrentUser - Successfully found user:', formattedUser.name);
    console.log('✅ getCurrentUser - User role:', formattedUser.role);
    console.log('✅ getCurrentUser - User year:', formattedUser.year);
    
    return formattedUser;
  } catch (error) {
    console.error('❌ getCurrentUser - Unexpected error:', error);
    return null;
  }
}

export async function getUserData(userId: string) {
  try {
    console.log('🔍 getUserData - Fetching data for user ID:', userId);
    
    await connectDB();
    
    const user = await Student.findById(userId).select('-password').lean(); // Changed from User to Student
    
    if (!user) {
      console.log('❌ getUserData - User not found for ID:', userId);
      throw new Error('User not found');
    }

    console.log('🔍 getUserData - Found user:', (user as any).name);

    // Simple type assertion to avoid TypeScript errors
    const userData = user as any;
    
    const formattedUser = {
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

    console.log('✅ getUserData - Successfully formatted user data');
    return formattedUser;
  } catch (error) {
    console.error('❌ getUserData - Error:', error);
    throw new Error('Failed to fetch user data');
  }
}

export async function getUserProgress(userId: string) {
  try {
    console.log('🔍 getUserProgress - Fetching progress for user ID:', userId);
    
    await connectDB();
    
    const user = await Student.findById(userId).select('roadmapProgress brandingProgress savedResources year').lean(); // Changed from User to Student
    
    if (!user) {
      console.log('❌ getUserProgress - User not found for ID:', userId);
      throw new Error('User not found');
    }

    // Simple type assertion
    const userData = user as any;

    console.log('🔍 getUserProgress - Raw progress data:', {
      roadmapProgress: userData.roadmapProgress,
      brandingProgress: userData.brandingProgress,
      savedResources: userData.savedResources
    });

    // Simple progress calculation
    const completedRoadmapSteps = userData.roadmapProgress?.filter((p: any) => p.completed).length || 0;
    const completedBrandingTasks = userData.brandingProgress?.filter((p: any) => p.completed).length || 0;
    const savedResourcesCount = userData.savedResources?.length || 0;

    console.log('🔍 getUserProgress - Progress calculations:', {
      completedRoadmapSteps,
      completedBrandingTasks,
      savedResourcesCount
    });

    // Calculate percentages
    const roadmapProgress = Math.min(completedRoadmapSteps * 5, 100); // Simple percentage
    const brandingProgress = Math.min(completedBrandingTasks * 10, 100); // Simple percentage

    console.log('🔍 getUserProgress - Calculated percentages:', {
      roadmapProgress,
      brandingProgress
    });

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

    const progressData = {
      roadmapProgress,
      brandingProgress,
      savedResources: savedResourcesCount,
      recentActivity: recentActivity.slice(0, 5), // Only show 5 most recent
    };

    console.log('✅ getUserProgress - Final progress data:', progressData);
    return progressData;
  } catch (error) {
    console.error('❌ getUserProgress - Error:', error);
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

// Additional helper function to check authentication
export async function checkAuth() {
  try {
    const user = await getCurrentUser();
    return { 
      authenticated: !!user,
      user 
    };
  } catch (error) {
    console.error('❌ checkAuth - Error:', error);
    return { 
      authenticated: false,
      user: null 
    };
  }
}

// Function to clear user session (logout)
export async function logoutUser() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('user-data');
    console.log('✅ logoutUser - User session cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ logoutUser - Error:', error);
    return { success: false, error: 'Logout failed' };
  }
}