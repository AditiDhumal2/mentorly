'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function StudentDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        console.log('🔍 Dashboard - Checking authentication...');
        
        // 1. Check localStorage first (fastest)
        const session = localStorage.getItem('student-session');
        console.log('📱 localStorage session:', session ? 'Found' : 'Not found');
        
        if (session) {
          try {
            const sessionData = JSON.parse(session);
            console.log('✅ Using localStorage session:', sessionData.name);
            setUser(sessionData);
            setLoading(false);
            return;
          } catch (parseError) {
            console.error('❌ Error parsing localStorage session:', parseError);
            localStorage.removeItem('student-session');
          }
        }

        // 2. Try to fetch from server via API (if you have one)
        // If not, just use localStorage
        console.log('⚠️ No localStorage session, checking cookies...');
        
        // Try to read cookie directly
        const cookies = document.cookie;
        console.log('🍪 Cookies:', cookies);
        
        const studentCookie = cookies
          .split('; ')
          .find(row => row.startsWith('student-session-v2='))
          ?.split('=')[1];
        
        if (studentCookie) {
          try {
            const cookieData = JSON.parse(decodeURIComponent(studentCookie));
            console.log('✅ Using cookie session:', cookieData.name);
            setUser(cookieData);
            // Store in localStorage for next time
            localStorage.setItem('student-session', JSON.stringify(cookieData));
            setLoading(false);
            return;
          } catch (error) {
            console.error('❌ Error parsing cookie:', error);
          }
        }

        // 3. No session found anywhere
        console.log('❌ No authentication found');
        setError('Please log in to access the dashboard');
        
        // Wait a moment then redirect
        setTimeout(() => {
          router.push('/students-auth/login');
        }, 2000);
        
      } catch (error) {
        console.error('❌ Auth check error:', error);
        setError('Authentication error');
        router.push('/students-auth/login?error=auth_failed');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  // Simulated progress data (replace with real API call if needed)
  const [progress] = useState({
    roadmapProgress: 65,
    brandingProgress: 45,
    savedResources: 8,
    recentActivity: [
      { type: 'welcome', title: 'Account Created', time: 'Just now' },
      { type: 'course', title: 'Started Math Course', time: '2 days ago' },
      { type: 'progress', title: 'Completed 3 modules', time: '1 week ago' },
    ]
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Setting up your personalized dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            {error || 'Please log in to access your dashboard.'}
          </p>
          <div className="space-y-4">
            <button
              onClick={() => router.push('/students-auth/login')}
              className="w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Login
            </button>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // REAL USER DATA DISPLAY
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-8">
      {/* Welcome Header - Shows ACTUAL user data */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              Welcome back, <span className="text-yellow-300">{user.name}</span>! 👋
            </h1>
            <p className="text-lg opacity-90">
              <span className="font-semibold">Year {user.year || '1'}</span> • 
              <span className="font-semibold"> {user.college || 'Your College'}</span>
            </p>
            <p className="text-sm opacity-75 mt-2">
              Email: {user.email} | Student ID: {user.id?.substring(0, 8)}...
            </p>
          </div>
          
          {/* Profile Photo */}
          <div className="relative">
            {user.profilePhoto ? (
              <img 
                src={user.profilePhoto} 
                alt={user.name}
                className="w-20 h-20 rounded-full border-4 border-white/30 object-cover"
              />
            ) : (
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold border-4 border-white/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📊</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Learning Progress</h3>
              <p className="text-sm text-gray-600">Overall completion</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000" 
              style={{ width: `${progress.roadmapProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress.roadmapProgress}% complete</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Career Readiness</h3>
              <p className="text-sm text-gray-600">Branding tasks</p>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-500 transition-all duration-1000" 
              style={{ width: `${progress.brandingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{progress.brandingProgress}% complete</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Saved Resources</h3>
              <p className="text-sm text-gray-600">Learning materials</p>
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800">{progress.savedResources}</p>
          <p className="text-sm text-gray-600 mt-2">Resources saved</p>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Link 
          href="/students/highereducation"
          className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="text-3xl mb-3">🎓</div>
          <h3 className="font-bold text-gray-800 mb-1">Higher Education</h3>
          <p className="text-sm text-gray-600">Study abroad guidance</p>
        </Link>

        <Link 
          href="/students/mentor-selection"
          className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="text-3xl mb-3">👥</div>
          <h3 className="font-bold text-gray-800 mb-1">Find Mentors</h3>
          <p className="text-sm text-gray-600">Connect with experts</p>
        </Link>

        <Link 
          href="/students/resources"
          className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="text-3xl mb-3">📚</div>
          <h3 className="font-bold text-gray-800 mb-1">Resources</h3>
          <p className="text-sm text-gray-600">Study materials</p>
        </Link>

        <Link 
          href="/students/profile"
          className="bg-white p-6 rounded-xl shadow border hover:shadow-lg transition-all hover:scale-105"
        >
          <div className="text-3xl mb-3">👤</div>
          <h3 className="font-bold text-gray-800 mb-1">Profile</h3>
          <p className="text-sm text-gray-600">Update your information</p>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg border">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {progress.recentActivity.map((activity: any, index: number) => (
            <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                activity.type === 'welcome' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'course' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {activity.type === 'welcome' ? '👋' : activity.type === 'course' ? '📚' : '📈'}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{activity.title}</h4>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="mt-8 text-center">
        <button
          onClick={() => {
            // Clear everything
            localStorage.removeItem('student-session');
            document.cookie = 'student-session-v2=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            window.location.href = '/students-auth/login';
          }}
          className="px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}