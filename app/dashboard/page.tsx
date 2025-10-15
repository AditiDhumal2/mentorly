// app/dashboard/page.tsx
import { getCurrentUser, getUserProgress } from '@/actions/userActions';
import { redirect } from 'next/navigation';
import DashboardClient from './components/DashboardClient';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

export default async function DashboardPage() {
  // Get user data directly from server action
  const userData = await getCurrentUser();
  
  console.log('🔍 DashboardPage - User data:', userData);
  
  if (!userData) {
    console.log('❌ DashboardPage - No user found, redirecting to login');
    redirect('/auth/login'); // FIXED: Changed from '/login' to '/auth/login'
  }

  // FIXED: Check if user is admin and redirect to admin page
  if (userData.role === 'admin') {
    console.log('🔄 DashboardPage - User is admin, redirecting to admin page');
    redirect('/admin');
  }

  // Get progress data for students only
  const progressData = await getUserProgress(userData._id);

  // Convert recent activity to activities format
  const activities: Activity[] = progressData.recentActivity.map((activity: any, index: number) => ({
    id: `activity-${index}`,
    type: activity.type,
    title: activity.title,
    description: getActivityDescription(activity.type),
    time: activity.time,
    icon: getActivityIcon(activity.type)
  }));

  // Set time-based greeting
  const hour = new Date().getHours();
  let timeOfDay = 'Evening';
  if (hour < 12) timeOfDay = 'Morning';
  else if (hour < 17) timeOfDay = 'Afternoon';

  console.log('✅ DashboardPage - Rendering student dashboard for:', userData.name);
  return (
    <DashboardClient 
      userData={userData}
      progressData={progressData}
      activities={activities}
      timeOfDay={timeOfDay}
    />
  );
}

// Helper function to get activity descriptions
function getActivityDescription(type: string): string {
  switch (type) {
    case 'account': return 'Your account was successfully created';
    case 'welcome': return 'Welcome to your learning journey';
    case 'roadmap': return 'Progress made in your learning path';
    case 'branding': return 'Career branding tasks completed';
    default: return 'New activity recorded';
  }
}

// Helper function to get activity icons
function getActivityIcon(type: string): string {
  switch (type) {
    case 'account': return '👤';
    case 'welcome': return '👋';
    case 'roadmap': return '🗺️';
    case 'branding': return '⭐';
    case 'course': return '📚';
    case 'achievement': return '🏆';
    case 'resource': return '💎';
    default: return '📝';
  }
}