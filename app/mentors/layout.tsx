import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';
import MentorMenu from './components/MentorMenu';

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
    const currentUser = await getCurrentUserForMentorRoute();
    
    console.log('🔍 MENTOR LAYOUT: Current user:', currentUser);

    if (!currentUser) {
      console.log('❌ MENTOR LAYOUT: No user, redirecting to login');
      redirect('/mentors-auth/login');
    }

    if (currentUser.role !== 'mentor') {
      console.log('❌ MENTOR LAYOUT: Not a mentor, redirecting');
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

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="flex min-h-screen">
          {/* Sidebar Menu - Always show for mentor routes */}
          <div className="w-64 flex-shrink-0">
            <MentorMenu 
              isModerator={isModerator} 
              currentUser={currentUser as Mentor}
            />
          </div>
          
          {/* Main Content */}
          <main className="flex-1 p-6 overflow-auto">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  } catch (error) {
    console.error('❌ MENTOR LAYOUT: Error in layout:', error);
    redirect('/mentors-auth/login');
  }
}