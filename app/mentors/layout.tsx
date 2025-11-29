import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';
import MentorMenu from './components/MentorMenu';
import { headers } from 'next/headers';

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

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔄 MENTOR LAYOUT: Starting server component...');
  
  try {
    // Get current path from headers
    const headersList = await headers();
    const pathname = headersList.get('x-invoke-path') || '';
    console.log('📍 MENTOR LAYOUT: Current path:', pathname);

    // Skip auth check for auth pages to prevent redirect loops
    if (pathname.includes('/mentors-auth/')) {
      console.log('✅ MENTOR LAYOUT: Allowing access to auth pages');
      return <>{children}</>;
    }

    const currentUser = await getCurrentUserForMentorRoute();
    
    console.log('🔍 MENTOR LAYOUT: Current user:', currentUser ? 'Authenticated' : 'Not authenticated');

    if (!currentUser) {
      console.log('❌ MENTOR LAYOUT: No user, redirecting to login');
      redirect('/mentors-auth/login');
    }

    if (currentUser.role !== 'mentor') {
      console.log('❌ MENTOR LAYOUT: Not a mentor, redirecting to login');
      redirect('/mentors-auth/login');
    }

    console.log('✅ MENTOR LAYOUT: User authenticated:', currentUser.name);

    // Check moderator status
    let isModerator = false;
    if (currentUser.id) {
      try {
        const { isUserModerator } = await import('@/actions/moderator-actions');
        isModerator = await isUserModerator(currentUser.id);
        console.log('🛡️ MENTOR LAYOUT: Moderator status:', isModerator);
      } catch (error) {
        console.error('MENTOR LAYOUT: Error checking moderator status:', error);
        isModerator = false;
      }
    }

    console.log('🎯 MENTOR LAYOUT: Rendering layout with sidebar...');

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
      pathname.startsWith(path)
    );

    console.log('📋 MENTOR LAYOUT: Show sidebar:', showSidebar);

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex min-h-screen">
          {/* Sidebar Menu */}
          {showSidebar && (
            <div className="w-64 flex-shrink-0">
              <MentorMenu 
                isModerator={isModerator} 
                currentUser={currentUser as Mentor}
              />
            </div>
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
  } catch (error) {
    console.error('❌ MENTOR LAYOUT: Error in layout:', error);
    // Don't redirect on error to prevent loops, just show children
    return <>{children}</>;
  }
}