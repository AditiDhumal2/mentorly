'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadProfilePhotoAction, deleteProfilePhotoAction } from '@/actions/profile-actions';
import Link from 'next/link';

interface Student {
  _id: string;
  id: string;
  name: string;
  email: string;
  role: string;
  year: string;
  college: string;
  profilePhoto?: string;
  profiles: any;
  interests: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardClientProps {
  initialUser: Student | null;
  initialProgress: any;
}

export default function DashboardClient({ initialUser, initialProgress }: DashboardClientProps) {
  const [user, setUser] = useState<Student | null>(initialUser);
  const [progress, setProgress] = useState<any>(initialProgress);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if user exists
    if (!initialUser) {
      console.log('❌ No user from server, checking localStorage...');
      
      // Check localStorage as backup
      const session = localStorage.getItem('student-session');
      if (session) {
        try {
          const sessionData = JSON.parse(session);
          console.log('📱 Found session in localStorage:', sessionData);
          
          // We have session but server doesn't see cookie (Netlify issue)
          // Reload to try to sync cookies
          console.log('🔄 Reloading to sync cookies...');
          window.location.reload();
          return;
        } catch (error) {
          console.error('Error parsing localStorage session:', error);
        }
      }
      
      // No session anywhere, redirect to login
      console.log('❌ No session found, redirecting to login');
      router.push('/students-auth/login?error=no_session');
    }
    
    setAuthChecked(true);
  }, [initialUser, router]);

  // Show loading until auth check
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If no user after auth check
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            Please log in to access your student dashboard.
          </p>
          <Link 
            href="/students-auth/login"
            className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const userRole = user.role as "mentor" | "student";
      
      const result = await uploadProfilePhotoAction(user._id, userRole, formData);

      if (result.success && result.imageUrl) {
        setUploadMessage('✅ Profile photo saved successfully!');
        setUser({ ...user, profilePhoto: result.imageUrl });
        
        // Update localStorage session
        const session = localStorage.getItem('student-session');
        if (session) {
          const sessionData = JSON.parse(session);
          sessionData.profilePhoto = result.imageUrl;
          localStorage.setItem('student-session', JSON.stringify(sessionData));
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setUploadMessage(`❌ ${result.error || 'Failed to save photo'}`);
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadMessage('❌ Error saving photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleDeletePhoto = async () => {
    if (!user?.profilePhoto) return;

    try {
      const userRole = user.role as "mentor" | "student";
      
      const result = await deleteProfilePhotoAction(user._id, userRole);

      if (result.success) {
        setUploadMessage('✅ Profile photo removed successfully!');
        setUser({ ...user, profilePhoto: undefined });
        
        // Update localStorage session
        const session = localStorage.getItem('student-session');
        if (session) {
          const sessionData = JSON.parse(session);
          delete sessionData.profilePhoto;
          localStorage.setItem('student-session', JSON.stringify(sessionData));
        }
        
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setUploadMessage(`❌ ${result.error || 'Failed to remove photo'}`);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setUploadMessage('❌ Error removing photo');
    }
  };

  const userName = user.name || 'Student';
  const userCollege = user.college || 'your college';
  const userYear = user.year || '1';
  const userProfilePhoto = user.profilePhoto;
  
  const roadmapProgress = progress?.roadmapProgress || 0;
  const brandingProgress = progress?.brandingProgress || 0;

  console.log('✅ Dashboard Client - Rendering for:', userName);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Photo */}
              <div className="relative">
                {userProfilePhoto ? (
                  <img 
                    src={userProfilePhoto} 
                    alt={userName}
                    className="w-16 h-16 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome back, {userName.split(' ')[0]}! 👋
                </h1>
                <p className="text-blue-100">
                  Year {userYear} • {userCollege}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Student ID: {user._id?.substring(0, 8)}...
                </p>
              </div>
            </div>
            
            {/* Profile Link */}
            <Link 
              href="/students/profile" 
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              View Profile
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Year</h3>
            <p className="text-2xl font-bold text-blue-600">Year {userYear}</p>
            <p className="text-gray-600 text-sm">Current academic year</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Progress</h3>
            <p className="text-2xl font-bold text-green-600">{roadmapProgress}%</p>
            <p className="text-gray-600 text-sm">Roadmap completion</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${roadmapProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Readiness</h3>
            <p className="text-2xl font-bold text-purple-600">{brandingProgress}%</p>
            <p className="text-gray-600 text-sm">Branding progress</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-purple-600 h-2 rounded-full" 
                style={{ width: `${brandingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/students/courses"
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left"
            >
              <div className="text-blue-600 text-lg mb-2">📚</div>
              <p className="text-sm font-medium text-gray-900">My Courses</p>
              <p className="text-xs text-gray-500 mt-1">Explore learning materials</p>
            </Link>
            
            <Link 
              href="/students/roadmap"
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left"
            >
              <div className="text-green-600 text-lg mb-2">🗺️</div>
              <p className="text-sm font-medium text-gray-900">Roadmap</p>
              <p className="text-xs text-gray-500 mt-1">View your learning path</p>
            </Link>
            
            <Link 
              href="/students/highereducation"
              className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left"
            >
              <div className="text-purple-600 text-lg mb-2">🎓</div>
              <p className="text-sm font-medium text-gray-900">Higher Education</p>
              <p className="text-xs text-gray-500 mt-1">Study abroad guidance</p>
            </Link>
            
            <Link 
              href="/students/mentor-selection"
              className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-left"
            >
              <div className="text-orange-600 text-lg mb-2">👥</div>
              <p className="text-sm font-medium text-gray-900">Find Mentor</p>
              <p className="text-xs text-gray-500 mt-1">Connect with experts</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            {progress?.recentActivity?.length > 0 ? (
              progress.recentActivity.map((activity: any, index: number) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'roadmap' ? 'bg-green-500' :
                    activity.type === 'branding' ? 'bg-purple-500' :
                    activity.type === 'account' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity yet</p>
                <p className="text-sm mt-1">Start exploring the platform to see your activity here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}