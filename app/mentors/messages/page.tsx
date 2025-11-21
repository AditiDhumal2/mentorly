// app/mentors/messages/page.tsx
import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import MessagesClient from '@/components/messaging/MessagesClient';
import { redirect } from 'next/navigation';

export default async function MentorMessagesPage() {
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Chat with students and other mentors privately
        </p>
      </div>
      
      <MessagesClient 
        currentUser={currentUser}
        basePath="/mentors"
      />
    </div>
  );
}