import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import MessagesClient from '@/components/messaging/MessagesClient';
import { redirect } from 'next/navigation';

// Define the expected user type for MessagesClient
interface MessagesUser {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  profilePhoto?: string;
}

export default async function MentorMessagesPage() {
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  // Transform the user object to match the expected type
  const transformedUser: MessagesUser = {
    _id: currentUser._id,
    id: currentUser.id,
    name: currentUser.name,
    email: currentUser.email,
    role: currentUser.role as 'student' | 'mentor' | 'admin', // Type assertion
    profilePhoto: currentUser.profilePhoto
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header - Stats Removed */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border border-blue-200/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Personal Messages</h1>
            <p className="text-lg text-gray-700 max-w-2xl">
              Connect privately with students and fellow mentors. Share insights, 
              provide guidance, and build meaningful professional relationships.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30">
              <div className="text-2xl font-bold text-blue-600 text-center">💬</div>
              <div className="text-sm text-gray-600 mt-1">Secure</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-purple-200/30">
              <div className="text-2xl font-bold text-purple-600 text-center">⚡</div>
              <div className="text-sm text-gray-600 mt-1">Real-time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Client - Directly after header without stats */}
      <MessagesClient 
        currentUser={transformedUser}
        basePath="/mentors"
      />

      {/* Quick Tips */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-200/50">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Messaging Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Be professional and respectful in all communications</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Respond within 24 hours for best engagement</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Use clear and concise language</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Share relevant resources and guidance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}