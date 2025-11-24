 // app/mentors/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { checkMentorAuth } from '@/actions/mentor-auth-actions';
import { mentorLogout } from '@/app/mentors-auth/login/actions/mentor-login.actions';
import { uploadProfilePhotoAction } from '@/actions/profile-actions';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Mentor {
  id: string;
  _id: string;
  name: string;
  email: string;
  profileCompleted: boolean;
  approvalStatus: string;
  expertise: string[];
  college: string;
  experience: number;
  rating: number;
  totalSessions: number;
  profilePhoto?: string;
  stats: {
    studentsHelped: number;
    responseTime: number;
    satisfactionRate: number;
  };
}

interface DashboardStats {
  upcomingSessions: number;
  completedSessions: number;
  studentsHelped: number;
  rating: number;
  pendingRequests: number;
  totalEarnings: number;
}

interface Session {
  id: number;
  title: string;
  student: string;
  date: string;
  time: string;
  type: string;
}

interface Activity {
  id: number;
  type: string;
  title: string;
  student: string;
  time: string;
  status: string;
  icon: string;
}

export default function MentorDashboard() {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deniedReason, setDeniedReason] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    upcomingSessions: 0,
    completedSessions: 0,
    studentsHelped: 0,
    rating: 5.0,
    pendingRequests: 0,
    totalEarnings: 0
  });

  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<Session[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuthAndAccess = async () => {
      try {
        console.log('🔍 Checking mentor authentication...');
        const authResult = await checkMentorAuth();
        
        console.log('🔍 Auth result:', authResult);
        
        if (!authResult.isAuthenticated || !authResult.mentor) {
          console.log('❌ Not authenticated, redirecting to login');
          window.location.href = '/mentors-auth/login';
          return;
        }

        const mentorData = authResult.mentor as Mentor;
        console.log('✅ Mentor authenticated:', mentorData.name);
        setMentor(mentorData);

        // 🎯 STRICT ACCESS CONTROL
        if (!mentorData.profileCompleted) {
          console.log('❌ Profile not completed, denying access');
          setAccessDenied(true);
          setDeniedReason('profile');
          return;
        }

        if (mentorData.approvalStatus !== 'approved') {
          console.log('❌ Mentor not approved, denying access');
          setAccessDenied(true);
          setDeniedReason('approval');
          return;
        }

        // ✅ Only approved mentors with completed profiles can access dashboard
        console.log('✅ Mentor has full dashboard access');
        loadDashboardData(mentorData);

      } catch (error) {
        console.error('❌ Error checking auth:', error);
        window.location.href = '/mentors-auth/login';
      } finally {
        setLoading(false);
      }
    };

    const loadDashboardData = (mentorData: Mentor) => {
      // Use actual mentor data where available
      setStats({
        upcomingSessions: 2,
        completedSessions: mentorData.totalSessions || 15,
        studentsHelped: mentorData.stats?.studentsHelped || 8,
        rating: mentorData.rating || 4.8,
        pendingRequests: 3,
        totalEarnings: 1250
      });

      setRecentActivities([
        {
          id: 1,
          type: 'session',
          title: 'Career Guidance Session',
          student: 'Rajesh Kumar',
          time: '2 hours ago',
          status: 'completed',
          icon: '🎯'
        },
        {
          id: 2,
          type: 'request',
          title: 'New Session Request',
          student: 'Priya Sharma',
          time: '5 hours ago',
          status: 'pending',
          icon: '🆕'
        },
        {
          id: 3,
          type: 'message',
          title: 'New Message',
          student: 'Amit Patel',
          time: '1 day ago',
          status: 'unread',
          icon: '💬'
        },
        {
          id: 4,
          type: 'review',
          title: 'New 5-star Review',
          student: 'Neha Singh',
          time: '2 days ago',
          status: 'positive',
          icon: '⭐'
        }
      ]);

      setUpcomingSessions([
        {
          id: 1,
          title: 'Technical Interview Prep',
          student: 'Sneha Verma',
          date: 'Today',
          time: '3:00 PM - 4:00 PM',
          type: 'technical'
        },
        {
          id: 2,
          title: 'Study Abroad Guidance',
          student: 'Rohan Mehta',
          date: 'Tomorrow',
          time: '11:00 AM - 12:00 PM',
          type: 'higher-education'
        }
      ]);
    };

    checkAuthAndAccess();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !mentor) return;

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('profilePhoto', file);

      const result = await uploadProfilePhotoAction(mentor._id, 'mentor', formData);

      if (result.success && result.imageUrl) {
        setUploadMessage('Profile photo saved successfully!');
        setMentor({ ...mentor, profilePhoto: result.imageUrl });
      } else {
        setUploadMessage(result.error || 'Failed to save photo');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
      setUploadMessage('Error saving photo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleLogout = async () => {
    await mentorLogout();
    window.location.href = '/mentors-auth/login';
  };

  // Show access denied message
  if (accessDenied) {
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
            
            {deniedReason === 'profile' && (
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

            {deniedReason === 'approval' && (
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Not authenticated</p>
          <Link href="/mentors-auth/login" className="text-blue-600 hover:text-blue-800">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4">
      {/* Header with Logout */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mentor Dashboard</h1>
            <p className="text-gray-600">Welcome back, {mentor.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                {/* Mentor Profile Photo */}
                <div className="relative">
                  {mentor.profilePhoto ? (
                    <img 
                      src={mentor.profilePhoto} 
                      alt={mentor.name}
                      className="w-16 h-16 rounded-full border-2 border-white object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-white">
                      {mentor.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Welcome back, {mentor.name}! 👋</h1>
                  <p className="text-blue-100 text-lg">
                    Ready to inspire and guide the next generation of students?
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-sm text-blue-100">Mentor Level</div>
                  <div className="font-semibold">Pro Mentor</div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-sm text-blue-100">Member Since</div>
                  <div className="font-semibold">2024</div>
                </div>
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <div className="text-sm text-blue-100">Status</div>
                  <div className="font-semibold">Approved ✅</div>
                </div>
              </div>
            </div>
            <div className="mt-4 lg:mt-0 flex-shrink-0">
              <div className="bg-white/20 p-6 rounded-2xl text-center">
                <div className="text-2xl font-bold">{stats.rating}</div>
                <div className="text-blue-100 text-sm">Average Rating</div>
                <div className="flex justify-center mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className={`w-4 h-4 ${star <= Math.floor(stats.rating) ? 'text-yellow-400' : 'text-blue-200'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Photo Upload Section */}
        <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex items-center space-x-6">
            {/* Current Profile Photo */}
            <div className="flex-shrink-0">
              {mentor.profilePhoto ? (
                <img 
                  src={mentor.profilePhoto} 
                  alt={mentor.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
                  {mentor.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="flex-1">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {mentor.profilePhoto ? 'Change Profile Photo' : 'Upload Profile Photo'}
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
                    <span>Uploading to cloud...</span>
                  </div>
                )}

                {uploadMessage && (
                  <p className={`text-sm ${uploadMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                    {uploadMessage}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Upcoming Sessions</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.upcomingSessions}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600 font-medium">
              +2 this week
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Students Helped</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.studentsHelped}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600 font-medium">
              Active mentorship
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-xs text-orange-600 font-medium">
              Needs your attention
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">₹{stats.totalEarnings}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-3 text-xs text-green-600 font-medium">
              +₹250 this month
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <Link href="/mentors/sessions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/mentors/availability" className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl p-4 text-left transition-colors duration-200 group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white group-hover:bg-blue-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-blue-900">Set Availability</div>
                      <div className="text-sm text-blue-600">Update your schedule</div>
                    </div>
                  </div>
                </Link>

                <Link href="/mentors/sessions" className="bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl p-4 text-left transition-colors duration-200 group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-white group-hover:bg-green-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-green-900">View Sessions</div>
                      <div className="text-sm text-green-600">Manage bookings</div>
                    </div>
                  </div>
                </Link>

                <Link href="/mentors/messages" className="bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl p-4 text-left transition-colors duration-200 group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white group-hover:bg-purple-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-purple-900">Messages</div>
                      <div className="text-sm text-purple-600">Chat with students</div>
                    </div>
                  </div>
                </Link>

                <Link href="/profile" className="bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl p-4 text-left transition-colors duration-200 group">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center text-white group-hover:bg-orange-700 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-orange-900">View Profile</div>
                      <div className="text-sm text-orange-600">Update information</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {activity.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                          activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          activity.status === 'unread' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {activity.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{activity.student}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Upcoming Sessions */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
                <Link href="/mentors/sessions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View All
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingSessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{session.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{session.student}</p>
                        <div className="flex items-center mt-2 space-x-4">
                          <span className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {session.date}
                          </span>
                          <span className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {session.time}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        session.type === 'technical' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {session.type}
                      </span>
                    </div>
                    <div className="flex space-x-2 mt-3">
                      <button className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Join Session
                      </button>
                      <button className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting Started */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Getting Started</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-blue-600 text-sm font-bold">1</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Complete Your Profile</h3>
                    <p className="text-sm text-gray-600 mt-1">Add your expertise areas and bio to attract more students</p>
                    <Link href="/profile" className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block">
                      Update Profile →
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-green-600 text-sm font-bold">2</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Set Your Availability</h3>
                    <p className="text-sm text-gray-600 mt-1">Choose time slots when you're available for sessions</p>
                    <Link href="/mentors/availability" className="text-green-600 hover:text-green-800 text-sm font-medium mt-2 inline-block">
                      Set Availability →
                    </Link>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mt-1">
                    <span className="text-purple-600 text-sm font-bold">3</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900">Start Mentoring</h3>
                    <p className="text-sm text-gray-600 mt-1">Accept session requests and begin guiding students</p>
                    <Link href="/mentors/sessions" className="text-purple-600 hover:text-purple-800 text-sm font-medium mt-2 inline-block">
                      View Requests →
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Mentor Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-blue-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Mentor Tip of the Day</h3>
                  <p className="text-blue-700">
                    "Great mentors listen more than they speak. Focus on understanding your student's goals and challenges before offering solutions. Ask open-ended questions to encourage deeper thinking."
                  </p>
                  <div className="flex items-center mt-3 text-sm text-blue-600">
                    <span>Pro Tip</span>
                    <div className="ml-2 flex">
                      {[1, 2, 3].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.922-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}