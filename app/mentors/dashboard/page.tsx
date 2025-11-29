 // app/mentors/dashboard/page.tsx
'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { getCurrentMentor, getUserProgress } from '@/actions/userActions';
import { uploadProfilePhotoAction, deleteProfilePhotoAction } from '@/actions/profile-actions';
import Link from 'next/link';
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
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🎯 Mentor Dashboard - Fetching current mentor...');
        
        const mentorData = await getCurrentMentor();
        console.log('🎯 Mentor Dashboard - Mentor data:', mentorData);
        
        setMentor(mentorData as Mentor);

        if (mentorData?._id) {
          console.log('🎯 Mentor Dashboard - Fetching progress for ID:', mentorData._id);
          const progressData = await getUserProgress(mentorData._id);
          console.log('🎯 Mentor Dashboard - Progress data:', progressData);
          setProgress(progressData);
        } else {
          console.log('❌ Mentor Dashboard - No mentor ID found');
        }
      } catch (error) {
        console.error('❌ Mentor Dashboard - Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !mentor) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      // 🆕 FIX: Explicitly cast role to "mentor" | "student"
      const userRole = mentor.role as "mentor" | "student";
      
      const result = await uploadProfilePhotoAction(mentor._id, userRole, formData);

      if (result.success && result.imageUrl) {
        setUploadMessage('✅ Profile photo saved successfully!');
        setMentor({ ...mentor, profilePhoto: result.imageUrl });
        
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
    if (!mentor?.profilePhoto) return;

    try {
      // 🆕 FIX: Explicitly cast role to "mentor" | "student"
      const userRole = mentor.role as "mentor" | "student";
      
      const result = await deleteProfilePhotoAction(mentor._id, userRole);

      if (result.success) {
        setUploadMessage('✅ Profile photo removed successfully!');
        // 🆕 FIX: Set to undefined instead of null
        setMentor({ ...mentor, profilePhoto: undefined });
        
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

  // 🆕 BETTER AUTH CHECK
  if (!mentor || mentor.role !== 'mentor') {
    console.log('❌ Mentor Dashboard - Invalid mentor:', mentor);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated as mentor</p>
          <Link href="/mentors-auth/login" className="text-blue-600 hover:text-blue-800">
            Go to Mentor Login
          </Link>
        </div>
      </div>
    );
  }

  // 🆕 CHECK PROFILE COMPLETION AND APPROVAL
  if (!mentor.profileCompleted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-100 border border-yellow-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">Profile Incomplete</h2>
            <p className="text-yellow-700 mb-4">
              Please complete your mentor profile to access the dashboard.
            </p>
            <button
              onClick={() => router.push('/mentors/complete-profile')}
              className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700"
            >
              Complete Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mentor.approvalStatus !== 'approved') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-blue-100 border border-blue-400 rounded-lg p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Pending Approval</h2>
            <p className="text-blue-700 mb-4">
              Your mentor profile is {mentor.approvalStatus}. Please wait for admin approval.
            </p>
            <p className="text-sm text-blue-600">
              Status: {mentor.approvalStatus}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const mentorName = mentor?.name || 'Mentor';
  const mentorCollege = mentor?.college || 'your institution';
  const mentorExpertise = mentor?.expertise?.join(', ') || 'No expertise specified';
  const mentorProfilePhoto = mentor?.profilePhoto;
  
  const mentorProgress = progress?.mentorProgress || 0;
  const expertiseCount = progress?.expertiseCount || 0;
  const experienceLevel = progress?.experienceLevel || 'beginner';

  console.log('✅ Mentor Dashboard - Rendering for:', mentorName);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Profile Photo Display */}
              <div className="relative">
                {mentorProfilePhoto ? (
                  <img 
                    src={mentorProfilePhoto} 
                    alt={mentorName}
                    className="w-16 h-16 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                    {mentorName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Welcome, Mentor {mentorName.split(' ')[0]}! 🎓
                </h1>
                <p className="text-green-100">
                  Ready to guide students at {mentorCollege}
                </p>
                <p className="text-green-100 text-sm mt-1">
                  Expertise: {mentorExpertise}
                </p>
                <p className="text-green-100 text-sm">
                  Mentor ID: {mentor._id}
                </p>
              </div>
            </div>
            
            {/* Profile Link */}
            <Link 
              href="/mentors/profile" 
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Profile Photo Upload Section */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center space-x-6">
            {/* Current Profile Photo */}
            <div className="flex-shrink-0">
              {mentorProfilePhoto ? (
                <div className="relative group">
                  <img 
                    src={mentorProfilePhoto} 
                    alt={mentorName}
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
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
                  {mentorName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mentorProfilePhoto ? 'Change Profile Photo' : 'Upload Profile Photo'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                </div>
                
                <p className="text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF. Max size: 5MB
                </p>

                {uploading && (
                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Mentor Progress</h3>
            <p className="text-2xl font-bold text-green-600">{mentorProgress}%</p>
            <p className="text-gray-600 text-sm">Profile completion</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${mentorProgress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Areas of Expertise</h3>
            <p className="text-2xl font-bold text-blue-600">{expertiseCount}</p>
            <p className="text-gray-600 text-sm">Expertise areas</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {mentor.expertise?.slice(0, 3).map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  {skill}
                </span>
              ))}
              {mentor.expertise && mentor.expertise.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{mentor.expertise.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Experience Level</h3>
            <p className="text-2xl font-bold text-purple-600 capitalize">{experienceLevel}</p>
            <p className="text-gray-600 text-sm">Mentoring experience</p>
            <div className="mt-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div
                    key={star}
                    className={`w-3 h-3 rounded-full ${
                      star <= 
                      (experienceLevel === 'expert' ? 5 :
                       experienceLevel === 'advanced' ? 4 :
                       experienceLevel === 'intermediate' ? 3 :
                       experienceLevel === 'beginner' ? 2 : 1)
                        ? 'bg-purple-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => router.push('/mentors/sessions')}
              className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors text-left group"
            >
              <div className="text-blue-600 text-lg mb-2 group-hover:scale-110 transition-transform">🎯</div>
              <p className="text-sm font-medium text-gray-900">My Sessions</p>
              <p className="text-xs text-gray-500 mt-1">Manage mentoring sessions</p>
            </button>
            
            <button 
              onClick={() => router.push('/mentors/students')}
              className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors text-left group"
            >
              <div className="text-green-600 text-lg mb-2 group-hover:scale-110 transition-transform">👥</div>
              <p className="text-sm font-medium text-gray-900">My Students</p>
              <p className="text-xs text-gray-500 mt-1">View student connections</p>
            </button>
            
            <button 
              onClick={() => router.push('/mentors/schedule')}
              className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-left group"
            >
              <div className="text-purple-600 text-lg mb-2 group-hover:scale-110 transition-transform">📅</div>
              <p className="text-sm font-medium text-gray-900">Schedule</p>
              <p className="text-xs text-gray-500 mt-1">Manage availability</p>
            </button>
            
            <button 
              onClick={() => router.push('/mentors/analytics')}
              className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors text-left group"
            >
              <div className="text-orange-600 text-lg mb-2 group-hover:scale-110 transition-transform">📊</div>
              <p className="text-sm font-medium text-gray-900">Analytics</p>
              <p className="text-xs text-gray-500 mt-1">View performance insights</p>
            </button>
          </div>
        </div>

        {/* Mentor Resources */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Mentor Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-blue-600 text-lg">📚</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Mentoring Guide</h3>
                  <p className="text-sm text-gray-600">Best practices & tips</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-green-300 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-green-600 text-lg">🎓</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Training Materials</h3>
                  <p className="text-sm text-gray-600">Skill development</p>
                </div>
              </div>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="text-purple-600 text-lg">💼</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Career Resources</h3>
                  <p className="text-sm text-gray-600">Industry insights</p>
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
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="text-lg">{activity.icon || '📝'}</div>
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
                <p className="text-sm mt-1">Your mentoring activities will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Sessions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Sessions</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-sm">📅</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Career Guidance Session</p>
                  <p className="text-xs text-gray-600">Tomorrow, 2:00 PM</p>
                </div>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Scheduled</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-sm">💼</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Interview Preparation</p>
                  <p className="text-xs text-gray-600">In 3 days, 10:00 AM</p>
                </div>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Confirmed</span>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <button 
              onClick={() => router.push('/mentors/sessions')}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All Sessions →
            </button>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Sessions Completed</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600">Students Helped</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-purple-600">4.8</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="p-4">
              <div className="text-2xl font-bold text-orange-600">95%</div>
              <div className="text-sm text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}