// app/students/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getCurrentStudent, getUserProgress } from '@/actions/userActions';
import { uploadProfilePhotoAction, deleteProfilePhotoAction } from '@/actions/profile-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function StudentsDashboardPage() {
  const [user, setUser] = useState<Student | null>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🎯 Student Dashboard - Fetching current student...');
        
        const userData = await getCurrentStudent();
        console.log('🎯 Student Dashboard - User data:', userData);
        
        // 🆕 FIX: Check if user is authenticated and is a student
        if (!userData || userData.role !== 'student') {
          console.log('❌ Student Dashboard - No valid student session, redirecting to login');
          router.push('/students-auth/login');
          return;
        }

        setUser(userData as Student);

        if (userData?._id) {
          console.log('🎯 Student Dashboard - Fetching progress for ID:', userData._id);
          const progressData = await getUserProgress(userData._id);
          console.log('🎯 Student Dashboard - Progress data:', progressData);
          setProgress(progressData);
        } else {
          console.log('❌ Student Dashboard - No user ID found');
        }
      } catch (error) {
        console.error('❌ Student Dashboard - Error fetching data:', error);
        // 🆕 FIX: Redirect to login on error
        router.push('/students-auth/login');
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    fetchData();
  }, [router]); // 🆕 FIX: Added router to dependency array

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      // 🆕 FIX: Explicitly cast role to "mentor" | "student"
      const userRole = user.role as "mentor" | "student";
      
      const result = await uploadProfilePhotoAction(user._id, userRole, formData);

      if (result.success && result.imageUrl) {
        setUploadMessage('✅ Profile photo saved successfully!');
        setUser({ ...user, profilePhoto: result.imageUrl });
        
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
      // 🆕 FIX: Explicitly cast role to "mentor" | "student"
      const userRole = user.role as "mentor" | "student";
      
      const result = await deleteProfilePhotoAction(user._id, userRole);

      if (result.success) {
        setUploadMessage('✅ Profile photo removed successfully!');
        // 🆕 FIX: Set to undefined instead of null
        setUser({ ...user, profilePhoto: undefined });
        
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

  // 🆕 FIX: Show loading only until auth check is complete
  if (loading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // 🆕 FIX: Better auth check with immediate redirect
  if (!user || user.role !== 'student') {
    console.log('❌ Student Dashboard - Invalid user:', user);
    
    // Show temporary message before redirect
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Redirecting to login...</p>
          <Link href="/students-auth/login" className="text-blue-600 hover:text-blue-800">
            Click here if not redirected
          </Link>
        </div>
      </div>
    );
  }

  const userName = user?.name || 'Student';
  const userCollege = user?.college || 'your college';
  const userYear = user?.year || '1';
  const userProfilePhoto = user?.profilePhoto;
  
  const roadmapProgress = progress?.roadmapProgress || 0;
  const brandingProgress = progress?.brandingProgress || 0;

  console.log('✅ Student Dashboard - Rendering for:', userName);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section with Profile Photo */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Photo Display */}
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
                  Ready to continue your learning journey at {userCollege}
                </p>
                <p className="text-blue-100 text-sm mt-1">
                  Student ID: {user._id}
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

        {/* Profile Photo Upload Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center space-x-6">
            {/* Current Profile Photo */}
            <div className="flex-shrink-0">
              {userProfilePhoto ? (
                <div className="relative group">
                  <img 
                    src={userProfilePhoto} 
                    alt={userName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                  />
                  <button
                    onClick={handleDeletePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove photo"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {userProfilePhoto ? 'Change Profile Photo' : 'Upload Profile Photo'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>

                {uploading && (
                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span>Uploading to Cloudinary...</span>
                  </div>
                )}

                {uploadMessage && (
                  <p className={`text-sm font-medium ${
                    uploadMessage.includes('✅') ? 'text-green-600' : 
                    uploadMessage.includes('❌') ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Progress</h3>
            <p className="text-2xl font-bold text-blue-600">Year {userYear}</p>
            <p className="text-gray-600 text-sm">Current academic year</p>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Path</h3>
            <p className="text-2xl font-bold text-green-600">{roadmapProgress}%</p>
            <p className="text-gray-600 text-sm">Roadmap completion</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
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
                className="bg-purple-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${brandingProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/students/courses')}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left"
            >
              <div className="text-blue-600 text-lg mb-2">📚</div>
              <p className="text-sm font-medium text-gray-900">My Courses</p>
              <p className="text-xs text-gray-500 mt-1">Explore learning materials</p>
            </button>
            
            <button 
              onClick={() => router.push('/students/roadmap')}
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left"
            >
              <div className="text-green-600 text-lg mb-2">🗺️</div>
              <p className="text-sm font-medium text-gray-900">Roadmap</p>
              <p className="text-xs text-gray-500 mt-1">View your learning path</p>
            </button>
            
            <button 
              onClick={() => router.push('/students/placement')}
              className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left"
            >
              <div className="text-purple-600 text-lg mb-2">💼</div>
              <p className="text-sm font-medium text-gray-900">Placement</p>
              <p className="text-xs text-gray-500 mt-1">Career opportunities</p>
            </button>
            
            <button 
              onClick={() => router.push('/students/progress')}
              className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-left"
            >
              <div className="text-orange-600 text-lg mb-2">📊</div>
              <p className="text-sm font-medium text-gray-900">Progress</p>
              <p className="text-xs text-gray-500 mt-1">Track your growth</p>
            </button>
          </div>
        </div>

        {/* Learning Resources */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Learning Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-lg">🎯</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Study Materials</h3>
                  <p className="text-sm text-gray-600">Access course content</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-lg">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Assignments</h3>
                  <p className="text-sm text-gray-600">Submit your work</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-purple-600 text-lg">🧪</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Practice Tests</h3>
                  <p className="text-sm text-gray-600">Test your knowledge</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
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
                <div className="text-4xl mb-2">📊</div>
                <p>No recent activity yet</p>
                <p className="text-sm mt-1">Start exploring the platform to see your activity here</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Deadlines</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Math Assignment</p>
                  <p className="text-xs text-gray-600">Due in 2 days</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Pending</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">📚</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Science Project</p>
                  <p className="text-xs text-gray-600">Due in 5 days</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">In Progress</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}