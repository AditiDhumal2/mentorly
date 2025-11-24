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
    <div className="space-y-6">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-700">
              Chat with mentors and fellow students privately
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200/30">
              <div className="text-xl font-bold text-blue-600">💬</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Client */}
      <MessagesClient 
        currentUser={currentUser}
        basePath="/students"
      />

      {/* Quick Tips - Compact */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Messaging Tips</h3>
            <p className="text-xs text-gray-700">
              Be respectful and clear in your communication. Mentors typically respond within 24 hours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}