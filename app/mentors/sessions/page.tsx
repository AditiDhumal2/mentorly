import { getMentorSessions, getMentorStats } from '@/actions/mentor-sessions-actions';
import { getCurrentMentorUser } from '@/actions/mentor-auth-actions';
import MentorSessionsClient from './components/mentor-sessions-client';

export default async function MentorSessionsPage() {
  console.log('🔍 MentorSessionsPage - Starting...');
  
  const user = await getCurrentMentorUser();
  
  console.log('🔍 MentorSessionsPage - Auth result:', {
    hasUser: !!user,
    userRole: user?.role,
    userName: user?.name
  });

  if (!user) {
    console.log('❌ MentorSessionsPage - No mentor user');
    return null; // Layout will handle redirect
  }

  console.log('✅ MentorSessionsPage - User is authenticated mentor:', user.name);

  const [sessionsResult, statsResult] = await Promise.all([
    getMentorSessions(user._id),
    getMentorStats(user._id)
  ]);

  return (
    <MentorSessionsClient 
      initialSessions={sessionsResult.success ? sessionsResult.sessions : []}
      initialStats={statsResult.success ? statsResult.stats : null}
      user={user}
    />
  );
}