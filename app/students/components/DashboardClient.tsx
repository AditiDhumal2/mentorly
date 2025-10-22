'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface UserData {
  _id: string;
  name: string;
  email: string;
  year: number;
  college: string;
  role: string;
}

interface ProgressData {
  roadmapProgress: number;
  brandingProgress: number;
  savedResources: number;
  recentActivity: Array<{
    type: string;
    title: string;
    time: string;
  }>;
}

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
}

interface DashboardClientProps {
  userData: UserData;
  progressData: ProgressData;
  activities: Activity[];
  timeOfDay: string;
  studentCurrentYear: number;
}

export default function DashboardClient({ 
  userData, 
  progressData, 
  activities, 
  timeOfDay,
  studentCurrentYear
}: DashboardClientProps) {
  const router = useRouter();
  const { logout } = useAuth();
  
  // NUCLEAR SOLUTION: Completely block back button
  useAuthGuard();

  // Additional protection: Clear any cached authentication
  useEffect(() => {
    console.log('🛡️ DashboardClient - Setting up nuclear protection');
    
    if (typeof window !== 'undefined') {
      // Clear any cached authentication state
      localStorage.removeItem('auth-redirect');
      sessionStorage.removeItem('auth-redirect');
      
      // Set a flag that we're authenticated (for back button detection)
      sessionStorage.setItem('is-authenticated', 'true');
      
      // Replace history to prevent back navigation
      const cleanUrl = window.location.pathname;
      window.history.replaceState({ isAuthenticated: true }, '', cleanUrl);
      window.history.pushState({ isAuthenticated: true }, '', window.location.href);
      
      console.log('✅ DashboardClient - Nuclear protection activated');
    }
  }, []);

  const handleLogout = async () => {
    console.log('🚪 DashboardClient - Starting enhanced logout process');
    
    try {
      // Clear all authentication flags before logout
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('is-authenticated');
        localStorage.removeItem('auth-redirect');
        
        // Clear client-side storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies client-side as backup
        document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
        
        // Clear all potential auth cookies
        const authCookies = ['user-data', 'session', 'token', 'auth-token', 'user'];
        authCookies.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
      }
      
      // Use the logout function from AuthContext (which should handle server-side logout)
      logout();
      
    } catch (error) {
      console.error('❌ DashboardClient - Logout failed, forcing redirect:', error);
      // Fallback: force redirect to login - FIXED PATH
      window.location.href = '/students-auth/login?logout=true&fallback=true&t=' + Date.now();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      {/* Header with Logout */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Student Dashboard</h1>
          <p className="text-gray-400">Good {timeOfDay}, {userData.name}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors hover:scale-105 active:scale-95"
        >
          Logout
        </button>
      </div>

      <div className="space-y-8">
        {/* Interactive Welcome Header */}
        <div className="relative bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden border border-cyan-400/20 group hover:shadow-cyan-500/25 transition-all duration-300">
          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 right-4 w-20 h-20 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full animate-pulse delay-75"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-full animate-ping opacity-20"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-cyan-400/30 group-hover:scale-110 transition-transform">
                  <div className="text-white font-bold text-lg">{userData.name.charAt(0).toUpperCase()}</div>
                </div>
                <span className="text-cyan-200 text-sm font-medium">Good {timeOfDay}! ☀️</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full border border-cyan-400/30">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-cyan-200 text-xs">Online</span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-cyan-100 bg-clip-text text-transparent group-hover:scale-105 transition-transform">
              Welcome back, {userData.name}! 👋
            </h1>
            
            <p className="text-cyan-100 text-lg mb-6">
              You're in <span className="font-semibold text-white">Year {studentCurrentYear}</span> at{" "}
              <span className="font-semibold text-white">{userData.college}</span>.
              {userData.role === 'admin' && (
                <span className="block mt-2 text-yellow-300 font-semibold animate-pulse">
                  ⚡ Administrator Access Enabled
                </span>
              )}
              {userData.role === 'mentor' && (
                <span className="block mt-2 text-blue-300 font-semibold">
                  👥 Mentor Access Enabled
                </span>
              )}
            </p>

            {/* Interactive Stats Bar */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30 hover:bg-white/30 transition-colors cursor-pointer group/stat">
                <span className="text-yellow-300 group-hover/stat:scale-110 transition-transform">⭐</span>
                <span className="text-sm font-medium">Ready to Learn</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30 hover:bg-white/30 transition-colors cursor-pointer group/stat">
                <span className="text-green-300 group-hover/stat:scale-110 transition-transform">🚀</span>
                <span className="text-sm font-medium">Career Path Active</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-cyan-400/30 hover:bg-white/30 transition-colors cursor-pointer group/stat">
                <span className="text-cyan-300 group-hover/stat:scale-110 transition-transform">🎯</span>
                <span className="text-sm font-medium">Goals Set</span>
              </div>
              {userData.role === 'admin' && (
                <div className="flex items-center space-x-2 bg-yellow-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-yellow-400/30 hover:bg-yellow-500/30 transition-colors cursor-pointer group/stat">
                  <span className="text-yellow-300 group-hover/stat:scale-110 transition-transform">⚡</span>
                  <span className="text-sm font-medium">Admin Mode</span>
                </div>
              )}
              {userData.role === 'mentor' && (
                <div className="flex items-center space-x-2 bg-blue-500/20 backdrop-blur-sm px-4 py-2 rounded-full border border-blue-400/30 hover:bg-blue-500/30 transition-colors cursor-pointer group/stat">
                  <span className="text-blue-300 group-hover/stat:scale-110 transition-transform">👥</span>
                  <span className="text-sm font-medium">Mentor Mode</span>
                </div>
              )}
            </div>

            {/* Quick Progress Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{progressData.roadmapProgress}%</div>
                <div className="text-cyan-200 text-sm">Roadmap Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{progressData.brandingProgress}%</div>
                <div className="text-cyan-200 text-sm">Branding Progress</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{progressData.savedResources}</div>
                <div className="text-cyan-200 text-sm">Saved Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{activities.length}</div>
                <div className="text-cyan-200 text-sm">Activities</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Access Panel with Animation */}
        {(userData.role === 'admin' || userData.role === 'mentor') && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl border border-purple-400/30 hover:shadow-purple-500/25 transition-all duration-300 group/admin">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center group-hover/admin:scale-105 transition-transform">
                  <span className="mr-3 animate-pulse">⚡</span>
                  {userData.role === 'admin' ? 'Admin' : 'Mentor'} Dashboard Access
                </h2>
                <p className="text-purple-100">
                  {userData.role === 'admin' 
                    ? 'Full administrative access to manage platform content and users.'
                    : 'Mentor access to guide students and manage learning content.'
                  }
                </p>
              </div>
              <button
                onClick={() => router.push('/admin')}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl font-semibold hover:bg-purple-100 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
              >
                <span>Go to {userData.role === 'admin' ? 'Admin' : 'Mentor'} Dashboard</span>
                <span className="group-hover/admin:translate-x-1 transition-transform">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Interactive Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Roadmap Progress"
            value={`${progressData.roadmapProgress}%`}
            color="cyan"
            progress={progressData.roadmapProgress}
            icon="🗺️"
            description="Your learning path completion"
          />
          
          <StatCard
            title="Branding Progress"
            value={`${progressData.brandingProgress}%`}
            color="green"
            progress={progressData.brandingProgress}
            icon="⭐"
            description="Career branding tasks"
          />
          
          <StatCard
            title="Saved Resources"
            value={progressData.savedResources.toString()}
            color="yellow"
            progress={Math.min((progressData.savedResources / 20) * 100, 100)}
            icon="💎"
            description="Learning materials saved"
          />
          
          <StatCard
            title="Recent Activity"
            value={activities.length.toString()}
            color="purple"
            progress={Math.min((activities.length / 10) * 100, 100)}
            icon="📝"
            description="Total activities"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Recent Activity */}
          <div className="xl:col-span-2">
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6 hover:border-cyan-400/30 transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <span className="text-cyan-400 mr-2">📋</span>
                  Recent Activity
                </h2>
                <button className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors">
                  View All →
                </button>
              </div>
              
              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <ActivityItem
                    key={activity.id}
                    activity={activity}
                    index={index}
                  />
                ))}
                {activities.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <div className="text-4xl mb-2">📝</div>
                    <p>No activities yet</p>
                    <p className="text-sm">Start exploring to see your activity here</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-6 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 backdrop-blur-lg rounded-2xl shadow-lg border border-blue-400/30 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <span className="text-blue-400 mr-2">⚡</span>
                Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <QuickActionButton
                  icon="🎯"
                  label="Continue Learning"
                  description="Pick up where you left off"
                  color="blue"
                  onClick={() => router.push('/roadmap')}
                />
                <QuickActionButton
                  icon="📊"
                  label="View Progress"
                  description="Check your statistics"
                  color="cyan"
                  onClick={() => router.push('/dashboard/progress')}
                />
                <QuickActionButton
                  icon="💼"
                  label="Career Guidance"
                  description="Explore career paths"
                  color="green"
                  onClick={() => router.push('/career-domains')}
                />
                <QuickActionButton
                  icon="👥"
                  label="Find Mentor"
                  description="Connect with experts"
                  color="purple"
                  onClick={() => router.push('/community')}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Upcoming & Goals */}
          <div className="space-y-6">
            {/* Today's Focus */}
            <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/20 backdrop-blur-lg rounded-2xl shadow-lg border border-green-400/30 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-green-400 mr-2">🎯</span>
                Today's Focus
              </h2>
              <div className="space-y-3">
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-400/20 hover:bg-green-500/20 transition-colors cursor-pointer">
                  <h3 className="font-semibold text-white text-sm mb-2">Continue Learning Path</h3>
                  <p className="text-green-300 text-xs">{progressData.roadmapProgress}% completed</p>
                  <div className="mt-2 w-full bg-green-500/20 rounded-full h-2">
                    <div className="h-2 rounded-full bg-green-500" style={{ width: `${progressData.roadmapProgress}%` }}></div>
                  </div>
                </div>
                <button 
                  onClick={() => router.push('/roadmap')}
                  className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
                >
                  <span>Continue Learning</span>
                  <span>🚀</span>
                </button>
              </div>
            </div>

            {/* Weekly Goals Progress */}
            <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <span className="text-yellow-400 mr-2">📅</span>
                Weekly Goals
              </h2>
              <div className="space-y-4">
                {[
                  { goal: 'Complete roadmap modules', progress: progressData.roadmapProgress, icon: '🗺️' },
                  { goal: 'Work on branding tasks', progress: progressData.brandingProgress, icon: '⭐' },
                  { goal: 'Save learning resources', progress: Math.min((progressData.savedResources / 5) * 100, 100), icon: '💎' },
                  { goal: 'Track daily progress', progress: activities.length > 0 ? 100 : 0, icon: '📝' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50 hover:bg-gray-700/80 transition-colors">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{item.icon}</span>
                      <span className="text-white text-sm">{item.goal}</span>
                    </div>
                    <span className={`text-xs font-semibold ${
                      item.progress === 100 ? 'text-green-400' : 
                      item.progress > 50 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {item.progress}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Motivational Quote */}
            <div className="bg-gradient-to-br from-orange-600/20 to-red-600/20 backdrop-blur-lg rounded-2xl shadow-lg border border-orange-400/30 p-6 text-center">
              <div className="text-4xl mb-3">💪</div>
              <h3 className="text-white font-semibold mb-2">Keep Going!</h3>
              <p className="text-orange-200 text-sm">
                "The expert in anything was once a beginner. Every small step counts!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Interactive Stat Card Component
function StatCard({ title, value, color, progress, icon, description }: {
  title: string;
  value: string;
  color: 'cyan' | 'green' | 'yellow' | 'purple';
  progress: number;
  icon: string;
  description: string;
}) {
  const colorClasses = {
    cyan: 'from-cyan-500 to-blue-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-500',
    purple: 'from-purple-500 to-pink-500'
  };

  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60 hover:scale-105 transition-all duration-300 group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center text-white text-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{value}</div>
          <div className="text-gray-400 text-sm">{description}</div>
        </div>
      </div>
      
      <h3 className="font-semibold text-white mb-3">{title}</h3>
      
      <div className="w-full bg-gray-600 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-400">
        <span>Progress</span>
        <span>{progress}%</span>
      </div>
    </div>
  );
}

// Activity Item Component
function ActivityItem({ activity, index }: { activity: Activity; index: number }) {
  const typeColors: { [key: string]: string } = {
    course: 'bg-blue-500/20 text-blue-400 border-blue-400/30',
    roadmap: 'bg-cyan-500/20 text-cyan-400 border-cyan-400/30',
    achievement: 'bg-green-500/20 text-green-400 border-green-400/30',
    resource: 'bg-purple-500/20 text-purple-400 border-purple-400/30',
    account: 'bg-gray-500/20 text-gray-400 border-gray-400/30',
    welcome: 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30',
    branding: 'bg-pink-500/20 text-pink-400 border-pink-400/30'
  };

  const colorClass = typeColors[activity.type] || 'bg-gray-500/20 text-gray-400 border-gray-400/30';

  return (
    <div 
      className="flex items-center space-x-4 p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:bg-gray-700/80 hover:border-cyan-400/30 transition-all duration-300 cursor-pointer group"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass} group-hover:scale-110 transition-transform`}>
        <span className="text-sm">{activity.icon}</span>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-white text-sm group-hover:text-cyan-300 transition-colors">
          {activity.title}
        </h3>
        <p className="text-gray-400 text-xs mt-1">{activity.description}</p>
      </div>
      <div className="text-right">
        <span className="text-gray-500 text-xs">{activity.time}</span>
      </div>
    </div>
  );
}

// Quick Action Button Component
function QuickActionButton({ icon, label, description, color, onClick }: {
  icon: string;
  label: string;
  description: string;
  color: 'blue' | 'cyan' | 'green' | 'purple';
  onClick: () => void;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/30 text-blue-400',
    cyan: 'bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-400/30 text-cyan-400',
    green: 'bg-green-500/20 hover:bg-green-500/30 border-green-400/30 text-green-400',
    purple: 'bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/30 text-purple-400'
  };

  return (
    <button
      onClick={onClick}
      className={`p-4 rounded-xl border ${colorClasses[color]} transition-all duration-300 hover:scale-105 group cursor-pointer text-left w-full`}
    >
      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
      <h3 className="font-semibold text-white text-sm mb-1">{label}</h3>
      <p className="text-xs opacity-75">{description}</p>
    </button>
  );
}