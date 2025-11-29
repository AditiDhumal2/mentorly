import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';
import MentorLayoutClient from './components/MentorLayoutClient';

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

export const dynamic = 'force-dynamic';

export default async function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔄 MENTOR LAYOUT: Starting server component...');
  
  try {
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

    return (
      <MentorLayoutClient 
        currentUser={currentUser as Mentor}
        isModerator={isModerator}
      >
        {children}
      </MentorLayoutClient>
    );
  } catch (error) {
    console.error('❌ MENTOR LAYOUT: Error in layout:', error);
    // Fallback: render without sidebar
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    );
  }
}