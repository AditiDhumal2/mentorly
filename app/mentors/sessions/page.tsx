// app/mentors/sessions/page.tsx
import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';
import MentorSessionsClient from './components/mentor-sessions-client';
import { getMentorSessions, getMentorStats } from '@/actions/mentor-sessions-actions';

export default async function MentorSessionsPage() {
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  console.log('✅ MentorSessionsPage - User authenticated:', currentUser.name);

  // Load sessions and stats on server side
  const [sessionsResult, statsResult] = await Promise.all([
    getMentorSessions(currentUser._id),
    getMentorStats(currentUser._id)
  ]);

  return (
    <MentorSessionsClient 
      initialSessions={sessionsResult.success ? sessionsResult.sessions : []}
      initialStats={statsResult.success ? statsResult.stats : null}
      user={currentUser}
    />
  );
}