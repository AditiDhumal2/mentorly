'use client';

import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
    year: number;
    college: string;
    role: string;
  };
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { name: 'Roadmap', icon: '🗺️', path: '/roadmap' },
    { name: 'Placement Hub', icon: '💼', path: '/placement-hub' },
    { name: 'Career Domains', icon: '🎯', path: '/career-domains' },
    { name: 'Market Trends', icon: '📊', path: '/market-trends' },
    { name: 'Branding', icon: '⭐', path: '/branding' },
    { name: 'Resources', icon: '📚', path: '/resources' },
    { name: 'Community', icon: '💬', path: '/community' },
  ];

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Clear all auth cookies
      const cookies = [
        'user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
        'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT',
      ];

      cookies.forEach(cookie => {
        document.cookie = cookie;
      });

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();
      console.log('Cleared all storage');

      // Add a small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 300));

      // Redirect to login page - CORRECT PATH
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback redirect
      window.location.href = '/auth/login';
    }
  };

  // Use mock data if user prop is not provided
  const currentUser = user || {
    name: 'Guest User',
    email: 'guest@example.com',
    year: 1,
    college: 'Unknown College',
    role: 'student',
  };

  // Normalize role for comparison
  const normalizedRole = currentUser.role?.toLowerCase() || 'student';
  
  // ONLY show admin dashboard for actual admin users
  const isAdminUser = normalizedRole === 'admin';

  // Get display role with proper capitalization
  const getDisplayRole = () => {
    if (normalizedRole === 'admin') return 'Admin';
    if (normalizedRole === 'mentor') return 'Mentor';
    return 'Student';
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.3) 2%, transparent 0%), 
                           radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)`,
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-75"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-150"></div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-gray-800/80 backdrop-blur-lg border-r border-gray-700/60 shadow-2xl flex flex-col relative z-10">
        {/* Header with Logo */}
        <div className="p-6 border-b border-gray-700/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-lg relative">
                  M
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Mentorly</h1>
              <p className="text-xs text-cyan-300">Engineering Career Platform</p>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        <div className="p-6 border-b border-gray-700/60">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              {isAdminUser && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">A</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">{currentUser.name}</p>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-cyan-300 truncate">
                  Year {currentUser.year} • {currentUser.college.split(' ')[0]}
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  isAdminUser 
                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                    : normalizedRole === 'mentor'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    : 'bg-green-500/20 text-green-300 border border-green-500/30'
                }`}>
                  {getDisplayRole()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/50'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border border-transparent hover:border-cyan-500/30'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium text-sm">{item.name}</span>
                {isActive(item.path) && (
                  <div className="ml-auto w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
            
            {/* Admin Dashboard Link - ONLY for actual admin users */}
            {isAdminUser && (
              <div className="pt-4 mt-4 border-t border-gray-700/60">
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold px-3 mb-2">
                  Administration
                </p>
                <button
                  onClick={() => router.push('/admin')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 border border-purple-400/50'
                      : 'text-gray-300 hover:bg-purple-500/20 hover:text-white border border-transparent hover:border-purple-500/30'
                  }`}
                >
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium text-sm">Admin Dashboard</span>
                  {isActive('/admin') && (
                    <div className="ml-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  )}
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-700/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 p-3 rounded-xl text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200 border border-gray-600 hover:border-red-500/50"
          >
            <span className="text-lg">🚪</span>
            <span className="font-medium text-sm">Logout</span>
          </button>
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