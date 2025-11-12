'use client';

import { useEffect, useState } from 'react';
import { checkMentorAuth } from '@/app/mentors-auth/login/actions/mentor-login.actions';

interface Mentor {
  id: string;
  name: string;
  email: string;
}

export default function MentorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authResult = await checkMentorAuth();
        if (authResult.isAuthenticated && authResult.mentor) {
          setMentor(authResult.mentor);
        } else {
          window.location.href = '/mentors-auth/login';
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        window.location.href = '/mentors-auth/login';
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated</p>
          <a href="/mentors-auth/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navigation Bar - More Compact */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            <div className="flex items-center">
              <a href="/" className="text-lg font-bold text-gray-900">
                Mentor<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">ly</span>
              </a>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                <div className="text-xs text-gray-500">Mentor</div>
              </div>
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                {mentor.name.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - REMOVED MentorMenu from here */}
      <div className="max-w-7xl mx-auto py-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}