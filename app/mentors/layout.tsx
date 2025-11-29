 // app/mentors/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import MentorMenu from './components/MentorMenu';
import { usePathname, useRouter } from 'next/navigation';

interface Mentor {
  id: string;
  _id: string;
  name: string;
  email: string;
  role: string;
  profileCompleted?: boolean;
  approvalStatus?: string;
  expertise?: any;
  college?: any;
  profilePhoto?: any;
  profiles?: any;
  experience?: any;
  bio?: any;
  createdAt?: any;
  updatedAt?: any;
  mentorId?: any;
}

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

        // Try to get real user data with timeout
        const mentorData = await Promise.race([
          getCurrentUserForMentorRoute(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
        ]);

        console.log('🔍 Mentor layout - Raw mentor data from auth:', mentorData);

        if (!mentorData || mentorData.role !== 'mentor') {
          console.log('❌ No valid mentor session found');
          // Don't redirect immediately in production - let user see the error
          setError('Please log in to access mentor pages');
          setLoading(false);
          return;
        }

        console.log('👤 Final mentor data being used:', mentorData);
        setMentor(mentorData as Mentor);
        
        // Check moderator status in background (don't block on this)
        if (mentorData.id) {
          try {
            const { isUserModerator } = await import('@/actions/moderator-actions');
            const moderatorStatus = await isUserModerator(mentorData.id);
            setIsModerator(moderatorStatus);
          } catch (error) {
            console.error('Error checking moderator status:', error);
            setIsModerator(false);
          }
        }

      } catch (error) {
        console.error('❌ Error in mentor layout:', error);
        setError('Authentication failed. Please try logging in again.');
      } finally {
        setLoading(false);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Authentication Required</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button 
              onClick={() => router.push('/mentors-auth/login')}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Go to Mentor Login
            </button>
            <p className="text-sm text-red-600 mt-4">
              If this persists, check your browser cookies are enabled.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No mentor session found</p>
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
        {showSidebar && mentor && (
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