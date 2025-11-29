'use client';

import { usePathname } from 'next/navigation';
import MentorMenu from './MentorMenu';

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

interface MentorLayoutClientProps {
  children: React.ReactNode;
  currentUser: Mentor;
  isModerator: boolean;
}

export default function MentorLayoutClient({ 
  children, 
  currentUser, 
  isModerator 
}: MentorLayoutClientProps) {
  const pathname = usePathname();

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

  console.log('🔍 CLIENT LAYOUT: Current path:', pathname, 'Show sidebar:', showSidebar);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex min-h-screen">
        {/* Sidebar Menu */}
        {showSidebar && (
          <div className="w-64 flex-shrink-0">
            <MentorMenu 
              isModerator={isModerator} 
              currentUser={currentUser}
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
}