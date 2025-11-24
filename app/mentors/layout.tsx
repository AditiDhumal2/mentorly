 'use client';

import { useEffect, useState } from 'react';
import { checkMentorAuth } from '@/app/mentors-auth/login/actions/mentor-login.actions';
import MentorMenu from './components/MentorMenu';
import { usePathname, useRouter } from 'next/navigation';

interface Mentor {
  id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  approvalStatus: string;
}

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedReason, setDeniedReason] = useState('');
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const verifyAccess = async () => {
      try {
        console.log('🔄 Mentor layout verifying access for:', pathname);
        
        const authResult = await checkMentorAuth();
        
        if (!authResult.isAuthenticated || !authResult.mentor) {
          console.log('❌ Mentor not authenticated, redirecting to login');
          window.location.href = '/mentors-auth/login';
          return;
        }

        const mentorData = authResult.mentor;
        console.log('👤 Mentor data:', mentorData);

        setMentor(mentorData);

        // 🎯 STRICT ACCESS CONTROL FOR ALL MENTOR PAGES
        const currentPath = pathname || '';

        // Allow access to complete-profile only if profile is not completed
        if (currentPath === '/mentors/complete-profile') {
          if (mentorData.profileCompleted) {
            console.log('📝 Profile already completed, redirecting to pending approval');
            router.push('/mentors/pending-approval');
            return;
          }
          console.log('✅ Allowing access to complete-profile');
          setLoading(false);
          return;
        }

        // Allow access to pending-approval only if profile is completed but not approved
        if (currentPath === '/mentors/pending-approval') {
          if (!mentorData.profileCompleted) {
            console.log('📝 Profile not completed, redirecting to complete-profile');
            router.push('/mentors/complete-profile');
            return;
          }
          if (mentorData.approvalStatus === 'approved') {
            console.log('✅ Mentor approved, redirecting to dashboard');
            router.push('/mentors/dashboard');
            return;
          }
          console.log('✅ Allowing access to pending-approval');
          setLoading(false);
          return;
        }

        // For ALL other mentor routes (dashboard, community, etc.), require full approval
        if (!mentorData.profileCompleted) {
          console.log('📝 Profile not completed, showing access denied');
          setAccessDenied(true);
          setDeniedReason('profile');
          return;
        }

        if (mentorData.approvalStatus !== 'approved') {
          console.log('⏳ Mentor not approved, showing access denied');
          setAccessDenied(true);
          setDeniedReason('approval');
          return;
        }

        // ✅ Only approved mentors with completed profiles can access other pages
        console.log('✅ Mentor fully approved, allowing access');
        
        // Set loading to false first to render the page
        setLoading(false);
        
        // Then check moderator status separately to avoid blocking the render
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
        console.error('❌ Error verifying access:', error);
        window.location.href = '/mentors-auth/login';
      }
    };

    verifyAccess();
  }, [pathname, router]);

  // Show full-screen access denied for restricted pages
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8">
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Access Restricted
            </h1>
            
            {deniedReason === 'profile' && (
              <div className="space-y-6">
                <p className="text-gray-300 text-lg">
                  Please complete your profile setup to access mentor features.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/mentors/complete-profile'}
                    className="w-full px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-lg font-semibold"
                  >
                    Complete Your Profile
                  </button>
                  <p className="text-gray-400 text-sm">
                    You need to fill out your profile details before accessing the mentor portal.
                  </p>
                </div>
              </div>
            )}

            {deniedReason === 'approval' && (
              <div className="space-y-6">
                <p className="text-gray-300 text-lg">
                  Your profile is under admin review. You'll get access once approved.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => window.location.href = '/mentors/pending-approval'}
                    className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 text-lg font-semibold"
                  >
                    Check Approval Status
                  </button>
                  <p className="text-gray-400 text-sm">
                    Our team is reviewing your application. This usually takes 24-48 hours.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Contact support if you have any questions about your application.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Verifying your access...</p>
          <p className="text-gray-400 text-sm mt-2">Path: {pathname}</p>
        </div>
      </div>
    );
  }

  // Define which paths should show the sidebar - UPDATED TO INCLUDE MESSAGES
  const sidebarPaths = [
    '/mentors/dashboard',
    '/mentors/community',
    '/mentors/sessions',
    '/mentors/students',
    '/mentors/profile',
    '/mentors/moderator',
    '/mentors/messages' // Add this line to show sidebar on messages page
  ];

  const showSidebar = sidebarPaths.some(path => 
    pathname?.startsWith(path)
  ) && mentor?.approvalStatus === 'approved';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Sidebar Menu - Only show for approved mentors on specific pages */}
        {showSidebar && (
          <MentorMenu 
            isModerator={isModerator} 
            currentUser={mentor} // Pass the mentor data for message badges
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