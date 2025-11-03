'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { studentLogout } from '@/actions/userActions';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  year: string;
  college?: string;
  profiles?: any;
  interests?: string[];
  createdAt: string;
  updatedAt: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/students', description: 'Overview and analytics' },
    { name: 'Learning Roadmap', icon: '🗺️', path: '/students/roadmap', description: 'Your learning path' },
    { name: 'Placement Hub', icon: '💼', path: '/students/placement', description: 'Career opportunities' },
    { name: 'Career Domains', icon: '🎯', path: '/students/careerdomains', description: 'Explore career paths' },
    { name: 'Market Trends', icon: '📊', path: '/students/market-trends', description: 'Industry insights' },
    { name: 'Personal Branding', icon: '⭐', path: '/students/professionalbranding', description: 'Build your profile' },
    { name: 'Resources', icon: '📚', path: '/students/resources', description: 'Learning materials' },
    { name: 'Community Forum', icon: '💬', path: '/students/communityforum', description: 'Connect & discuss' },
    { name: 'Progress Tracking', icon: '📈', path: '/students/progress', description: 'Your achievements' },
  ];

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await studentLogout();
      
      if (result.success) {
        console.log('✅ Student logout successful, redirecting...');
        // Use hard redirect to ensure clean state
        window.location.href = result.redirectUrl;
      } else {
        console.error('❌ Student logout failed');
        // Fallback redirect
        window.location.href = '/students-auth/login?logout=success&fallback=true';
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Final fallback
      window.location.href = '/students-auth/login?logout=success&error=true';
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // User data helpers
  const getUserInitials = () => {
    if (!user?.name) return 'ST';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getCollegeShortName = () => {
    if (!user?.college) return 'College';
    return user.college.split(' ').map(word => word[0]).join('').toUpperCase();
  };

  const getDisplayName = () => {
    if (!user?.name) return 'Student User';
    return user.name;
  };

  const getDisplayEmail = () => {
    if (!user?.email) return 'student@example.com';
    return user.email;
  };

  const getDisplayYear = () => {
    if (!user?.year) return '1';
    return user.year;
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-75"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-150"></div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-blue-800/80 backdrop-blur-lg border-r border-blue-600/60 shadow-2xl flex flex-col relative z-10">
        
        {/* Header */}
        <div className="p-6 border-b border-blue-600/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg relative">
                  M
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-300 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mentorly</h1>
              <p className="text-xs text-cyan-200">Engineering Career Platform</p>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="p-4 border-b border-blue-600/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {getUserInitials()}
              </div>
              {/* Online status indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-blue-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {getDisplayName()}
              </p>
              <p className="text-xs text-cyan-200 truncate">
                {getDisplayEmail()}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <p className="text-xs text-cyan-300 truncate">
                  Year {getDisplayYear()} • {getCollegeShortName()}
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-300 border border-green-500/30">
                  Student
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            <p className="text-xs text-cyan-300 uppercase tracking-wider font-semibold px-3 mb-2">
              Navigation
            </p>
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/50'
                    : 'text-blue-100 hover:bg-blue-700/50 hover:text-white border border-transparent hover:border-cyan-400/30'
                }`}
              >
                <span className="text-lg group-hover:scale-110 transition-transform">{item.icon}</span>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-blue-200 truncate">{item.description}</p>
                </div>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-cyan-300 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-blue-600/60">
          <div className="space-y-3">
            {/* Security Status */}
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 text-xs font-medium">Secure Session</span>
              </div>
              <p className="text-green-200 text-xs mt-1">You are safely authenticated</p>
            </div>
            
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl text-blue-100 hover:bg-red-500/20 hover:text-red-200 transition-all duration-200 border border-blue-600 hover:border-red-400/50 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-lg group-hover:scale-110 transition-transform">🚪</span>
              <span className="text-sm font-medium">
                {isLoggingOut ? 'Logging Out...' : 'Logout'}
              </span>
              {isLoggingOut && (
                <div className="w-4 h-4 border-2 border-red-300 border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto relative z-10">
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}