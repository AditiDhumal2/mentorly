 // app/mentors/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getCurrentMentor } from '@/actions/userActions';
import { useRouter } from 'next/navigation';

interface Mentor {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  college: string;
  expertise: string[];
  profilePhoto?: string;
  profileCompleted: boolean;
  approvalStatus: string;
  experience?: string;
  bio?: string;
}

export default function MentorDashboard() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<string>('Starting...');
  const router = useRouter();

  useEffect(() => {
    const loadMentor = async () => {
      try {
        console.log('🎯 Dashboard - Starting to load mentor data...');
        setDebugInfo('Starting to load mentor data...');
        
        const mentorData = await getCurrentMentor();
        console.log('🎯 Dashboard - Raw mentor data:', mentorData);
        setDebugInfo(`Raw mentor data: ${JSON.stringify(mentorData, null, 2)}`);
        
        if (!mentorData) {
          console.log('❌ Dashboard - No mentor data returned');
          setDebugInfo('No mentor data returned from getCurrentMentor()');
          setLoading(false);
          return;
        }

        console.log('✅ Dashboard - Mentor loaded successfully:', mentorData.name);
        setDebugInfo(`Mentor loaded: ${mentorData.name}, Role: ${mentorData.role}`);
        setMentor(mentorData as Mentor);
        
      } catch (error) {
        console.error('❌ Dashboard - Error loading mentor:', error);
        setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
        console.log('🎯 Dashboard - Loading complete');
      }
    };

    loadMentor();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading mentor dashboard...</p>
          <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
            Debug: {debugInfo || 'No debug info yet...'}
          </p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">Authentication Failed</h2>
            <p className="text-red-700 mb-4">
              Could not load mentor data. Please try logging in again.
            </p>
            
            {/* Debug Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4 mb-4 text-left">
              <h3 className="font-semibold text-yellow-800 mb-2">Debug Information:</h3>
              <pre className="text-xs text-yellow-700 whitespace-pre-wrap">
                {debugInfo}
              </pre>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push('/mentors-auth/login')}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
              >
                Go to Mentor Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Reload Page
              </button>
              <button
                onClick={async () => {
                  // Clear cookies and redirect
                  try {
                    await fetch('/api/clear-cookies');
                    router.push('/mentors-auth/login');
                  } catch (error) {
                    console.error('Error clearing cookies:', error);
                  }
                }}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700"
              >
                Clear Cookies & Login Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 🆕 SIMPLE DASHBOARD CONTENT FOR TESTING
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Authentication Successful!</h3>
            <p className="text-green-700">Mentor data loaded successfully.</p>
          </div>

          {/* Debug Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Debug Information</h3>
            <pre className="text-sm text-blue-700 whitespace-pre-wrap">
              {debugInfo}
            </pre>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {mentor.name}! 🎓
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Mentor Dashboard - {mentor.college}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900">Status</h3>
              <p className="text-2xl font-bold text-blue-600 capitalize">
                {mentor.approvalStatus}
              </p>
              <p className="text-sm text-blue-700 mt-2">
                Profile: {mentor.profileCompleted ? 'Complete' : 'Incomplete'}
              </p>
            </div>
            
            <div className="bg-green-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-900">Expertise</h3>
              <p className="text-lg text-green-600">
                {mentor.expertise?.join(', ') || 'Not specified'}
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex gap-4">
              <button 
                onClick={() => router.push('/mentors/profile')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
              >
                Edit Profile
              </button>
              <button 
                onClick={() => router.push('/mentors/sessions')}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
              >
                My Sessions
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}