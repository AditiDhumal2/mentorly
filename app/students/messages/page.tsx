// app/students/messages/page.tsx
import { getCurrentUserForStudentRoute } from '@/actions/userActions';
import MessagesClient from '@/components/messaging/MessagesClient';
import { redirect } from 'next/navigation';

export default async function StudentMessagesPage() {
  const currentUser = await getCurrentUserForStudentRoute();
  
  if (!currentUser) {
    redirect('/students-auth/login');
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-2">
          Chat with mentors and other students privately
        </p>
      </div>
      
      <MessagesClient 
        currentUser={currentUser}
        basePath="/students"
      />
    </div>
  );
}