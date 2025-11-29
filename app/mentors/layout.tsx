 // app/mentors/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCurrentMentor } from '@/actions/userActions';
import MentorMenu from './components/MentorMenu';
import { usePathname, useRouter } from 'next/navigation';

interface Mentor {
  id: string;
  _id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  approvalStatus: string;
  role: string;
}

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        console.log('🔄 Mentor layout checking access for:', pathname);
        
        // Skip auth check for auth pages
        if (pathname?.includes('/mentors-auth/')) {
          console.log('✅ Allowing access to auth pages');
          setLoading(false);
          return;
        }

        const mentorData = await getCurrentMentor();
        console.log('🔍 Mentor layout - Raw mentor data:', mentorData);

        if (!mentorData) {
          console.log('❌ No mentor data found, redirecting to login');
          router.push('/mentors-auth/login');
          return;
        }

        console.log('👤 Mentor data received:', {
          id: mentorData.id,
          name: mentorData.name,
          profileCompleted: mentorData.profileCompleted,
          approvalStatus: mentorData.approvalStatus,
          role: mentorData.role
        });

        if (mentorData.role !== 'mentor') {
          console.log('❌ User is not a mentor, redirecting to login');
          router.push('/mentors-auth/login');
          return;
        }

        setMentor(mentorData as Mentor);
        setLoading(false);

        // Check moderator status in background
        if (mentorData.id) {
          try {
            const { isUserModerator } = await import('@/actions/moderator-actions');
            const moderatorStatus = await isUserModerator(mentorData.id);
            setIsModerator(moderatorStatus);
            console.log('🛡️ Moderator status:', moderatorStatus);
          } catch (error) {
            console.error('Error checking moderator status:', error);
            setIsModerator(false);
          }
        }

      } catch (error) {
        console.error('❌ Error in mentor layout:', error);
        setLoading(false);
        router.push('/mentors-auth/login');
      }
    };

    verifyAccess();
  }, [pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading mentor portal...</p>
          <p className="text-gray-400 text-sm mt-2">Path: {pathname}</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated as mentor</p>
          <button 
            onClick={() => router.push('/mentors-auth/login')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Mentor Login
          </button>
        </div>
      </div>
    );
  }

  // Define which paths should show the sidebar
  const sidebarPaths = [
    '/mentors/dashboard',
    '/mentors/community',
    '/mentors/sessions',
    '/mentors/students',
    '/mentors/profile',
    '/mentors/moderator',
    '/mentors/messages'
  ];

  const showSidebar = sidebarPaths.some(path => 
    pathname?.startsWith(path)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex min-h-screen">
        {/* Sidebar Menu */}
        {showSidebar && (
          <MentorMenu 
            isModerator={isModerator} 
            currentUser={mentor}
          />
        )}
        
        {/* Main Content */}
        <main className={`${showSidebar ? 'flex-1' : 'w-full'} p-6 overflow-auto`}>
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}