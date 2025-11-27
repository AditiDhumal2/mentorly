// app/mentors/dashboard/components/AccessDenied.tsx
'use client';

import { mentorLogout } from '@/app/mentors-auth/login/actions/mentor-login.actions';

interface AccessDeniedProps {
  reason: string;
}

export default function AccessDenied({ reason }: AccessDeniedProps) {
  const handleLogout = async () => {
    await mentorLogout();
    window.location.href = '/mentors-auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Access Restricted
          </h1>
          
          {reason === 'profile' && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Please complete your profile before accessing mentor features.
              </p>
              <button
                onClick={() => window.location.href = '/mentors/complete-profile'}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
              >
                Complete Profile
              </button>
            </div>
          )}

          {reason === 'approval' && (
            <div className="space-y-4">
              <p className="text-gray-300">
                Your profile is under admin review. You'll be able to access mentor features once approved.
              </p>
              <button
                onClick={() => window.location.href = '/mentors/pending-approval'}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
              >
                View Status
              </button>
            </div>
          )}
          
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-gray-300 underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}