 // app/mentors/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCurrentMentor } from '@/actions/userActions';
import { useRouter } from 'next/navigation';

interface Mentor {
  _id: string;
  name: string;
  email: string;
  role: string;
  college: string;
  expertise: string[];
  profilePhoto?: string;
  profileCompleted: boolean;
  approvalStatus: string;
}

export default function MentorDashboard() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const loadMentor = async () => {
      try {
        console.log('🎯 Dashboard - Starting to load mentor data...');
        
        const mentorData = await getCurrentMentor();
        console.log('🎯 Dashboard - Raw mentor data:', mentorData);
        
        if (!mentorData) {
          console.log('❌ Dashboard - No mentor data returned');
          router.push('/mentors-auth/login');
          return;
        }

        console.log('✅ Dashboard - Mentor loaded successfully:', mentorData.name);
        setMentor(mentorData as Mentor);
        
      } catch (error) {
        console.error('❌ Dashboard - Error loading mentor:', error);
        router.push('/mentors-auth/login');
      } finally {
        setLoading(false);
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
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated as mentor</p>
          <button 
            onClick={() => router.push('/mentors-auth/login')}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Go to Mentor Login
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ Dashboard - Rendering content for:', mentor.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl p-8 shadow-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome, {mentor.name}! 🎓
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Mentor Dashboard - {mentor.college}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
            
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-purple-900">Role</h3>
              <p className="text-lg text-purple-600">
                {mentor.role}
              </p>
              <p className="text-sm text-purple-700 mt-2">
                ID: {mentor._id}
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