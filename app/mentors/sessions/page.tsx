// app/mentors/sessions/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMentorSessions, getMentorStats } from '@/actions/mentor-sessions-actions';
import { checkMentorAuth } from '@/actions/mentor-auth-actions';
import MentorSessionsClient from './components/mentor-sessions-client';

export default function MentorSessionsPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 MentorSessionsPage - Starting client-side auth check...');
        
        // Use client-side auth check
        const authResult = await checkMentorAuth();
        
        console.log('🔍 MentorSessionsPage - Auth result:', {
          isAuthenticated: authResult?.isAuthenticated,
          hasMentor: !!authResult?.mentor
        });

        if (!authResult?.isAuthenticated || !authResult.mentor) {
          console.log('❌ MentorSessionsPage - No mentor user, redirecting to login');
          router.push('/mentors-auth/login');
          return;
        }

        setUser(authResult.mentor);
        console.log('✅ MentorSessionsPage - User is authenticated mentor:', authResult.mentor.name);

        // Load sessions and stats
        const [sessionsResult, statsResult] = await Promise.all([
          getMentorSessions(authResult.mentor._id),
          getMentorStats(authResult.mentor._id)
        ]);

        if (sessionsResult.success) {
          setSessions(sessionsResult.sessions || []);
        }

        if (statsResult.success) {
          setStats(statsResult.stats);
        }

      } catch (error) {
        console.error('❌ MentorSessionsPage - Error:', error);
        router.push('/mentors-auth/login');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Redirect will happen
  }

  return (
    <MentorSessionsClient 
      initialSessions={sessions}
      initialStats={stats}
      user={user}
    />
  );
}