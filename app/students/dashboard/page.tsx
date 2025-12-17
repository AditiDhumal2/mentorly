import { getCurrentStudent, getUserProgress } from '@/actions/userActions';
import DashboardClient from './DashboardClient';

export default async function StudentDashboardPage() {
  // Get user from server (works properly on Netlify)
  const user = await getCurrentStudent();
  
  console.log('🎯 Dashboard Server - User:', user ? user.name : 'Not logged in');
  
  let progress = null;
  if (user) {
    progress = await getUserProgress(user._id);
  }

  // Pass data to client component
  return <DashboardClient initialUser={user} initialProgress={progress} />;
}