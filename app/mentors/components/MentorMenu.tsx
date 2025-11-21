// app/mentors/components/MentorMenu.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react'; // Add useState import
import { 
  LayoutDashboard, 
  MessageSquare,
  Users,
  Calendar,
  UserCircle,
  LogOut,
  ChevronRight,
  CheckCircle,
  Shield,
  Mail
} from 'lucide-react';
import { mentorLogout } from '@/app/mentors-auth/login/actions/mentor-login.actions';
import MessageBadge from '@/components/messaging/MessageBadge';

// Define the menu item interface
interface MenuItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description: string;
  requiresApproval: boolean;
  hasBadge?: boolean; // Add optional hasBadge property
}

const baseMenuItems: MenuItem[] = [
  { 
    name: 'Dashboard', 
    href: '/mentors/dashboard', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    requiresApproval: true
  },
  { 
    name: 'Session Requests', 
    href: '/mentors/sessions', 
    icon: Calendar,
    description: 'Manage student sessions',
    requiresApproval: true
  },
  { 
    name: 'Community Forum', 
    href: '/mentors/community', 
    icon: MessageSquare,
    description: 'Connect with others',
    requiresApproval: true
  },
  { 
    name: 'Messages', 
    href: '/mentors/messages', 
    icon: Mail,
    description: 'Personal messaging',
    requiresApproval: true,
    hasBadge: true // Add hasBadge property
  },
  { 
    name: 'Students', 
    href: '/mentors/students', 
    icon: Users,
    description: 'Student management',
    requiresApproval: true
  },
  { 
    name: 'Profile', 
    href: '/mentors/profile', 
    icon: UserCircle,
    description: 'Edit your profile',
    requiresApproval: false
  }
];

const moderatorMenuItem: MenuItem = {
  name: 'Moderator', 
  href: '/mentors/moderator', 
  icon: Shield,
  description: 'Manage community content',
  requiresApproval: true
};

interface MentorMenuProps {
  stats?: {
    totalSessions: number;
    rating: number;
  };
  isModerator?: boolean; // Simple boolean from server
  currentUser?: any; // Add current user for message badge
}

export default function MentorMenu({ stats, isModerator = false, currentUser }: MentorMenuProps) {
  const pathname = usePathname();
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Build menu items dynamically based on moderator status from server
  const menuItems: MenuItem[] = [
    ...baseMenuItems,
    ...(isModerator ? [moderatorMenuItem] : [])
  ];

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const isActive = (href: string) => {
    if (href === '/mentors/dashboard') {
      return pathname === '/mentors/dashboard';
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = async () => {
    try {
      await mentorLogout();
      window.location.href = '/mentors-auth/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0">
      <nav className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-4 border border-gray-200/60 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
        {/* Sidebar Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Mentor Portal</h2>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <p className="text-xs text-green-600 font-medium">Approved</p>
              </div>
            </div>
          </div>
          {/* Moderator Badge */}
          {isModerator && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-700">Community Moderator</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="mb-6 grid grid-cols-2 gap-2">
          <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-200">
            <div className="text-blue-600 text-sm font-bold">
              {stats?.totalSessions || 0}
            </div>
            <div className="text-blue-500 text-xs">Sessions</div>
          </div>
          <div className="bg-green-50 rounded-xl p-3 text-center border border-green-200">
            <div className="text-green-600 text-sm font-bold">
              {stats?.rating ? stats.rating.toFixed(1) : '5.0'}
            </div>
            <div className="text-green-500 text-xs">Rating</div>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 border relative ${
                    active 
                      ? item.name === 'Messages'
                        ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm' 
                        : item.name === 'Moderator'
                        ? 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-200 shadow-sm'
                        : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm'
                      : 'border-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 hover:shadow-sm'
                  } ${
                    item.name === 'Messages' && !active
                      ? 'hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200'
                      : item.name === 'Moderator' && !active
                      ? 'hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 hover:border-orange-200'
                      : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        active 
                          ? item.name === 'Messages'
                            ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md'
                            : item.name === 'Moderator'
                            ? 'bg-gradient-to-br from-orange-600 to-red-600 text-white shadow-md'
                            : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md'
                          : item.name === 'Messages'
                          ? 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 text-purple-600'
                          : item.name === 'Moderator'
                          ? 'bg-gradient-to-br from-orange-100 to-red-100 group-hover:from-orange-200 group-hover:to-red-200 text-orange-600'
                          : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 text-blue-600'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {active && (
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full shadow-sm ${
                          item.name === 'Messages' ? 'bg-purple-500' :
                          item.name === 'Moderator' ? 'bg-orange-500' : 'bg-blue-500'
                        }`}></div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`font-medium transition-colors duration-200 text-sm ${
                        active 
                          ? item.name === 'Messages' ? 'text-purple-900' :
                            item.name === 'Moderator' ? 'text-orange-900' : 'text-blue-900'
                          : 'text-gray-900 group-hover:text-blue-700'
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-xs transition-colors duration-200 ${
                        active 
                          ? item.name === 'Messages' ? 'text-purple-600' :
                            item.name === 'Moderator' ? 'text-orange-600' : 'text-blue-600'
                          : 'text-gray-500 group-hover:text-blue-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  
                  {/* Message Badge */}
                  {item.hasBadge && currentUser && (
                    <MessageBadge 
                      userId={currentUser.id || currentUser._id} 
                      className="absolute -top-1 -right-1"
                      showSnackbar={showSnackbar}
                    />
                  )}
                  
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                    active 
                      ? item.name === 'Messages' ? 'text-purple-500' :
                        item.name === 'Moderator' ? 'text-orange-500' : 'text-blue-500'
                      : 'text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5'
                  } ${active ? 'translate-x-0.5' : ''}`} />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Logout Section */}
        <div className="mt-4 pt-4 border-t border-gray-200/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200/60 bg-white/50 hover:bg-red-50 hover:border-red-200 group transition-all duration-200"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center text-red-600 group-hover:from-red-200 group-hover:to-pink-200">
                <LogOut className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900 group-hover:text-red-700">Sign Out</div>
                <div className="text-xs text-gray-500 group-hover:text-red-600">Secure logout</div>
              </div>
            </div>
            <LogOut className="w-3 h-3 text-gray-400 group-hover:text-red-500" />
          </button>
        </div>

        {/* Help Section */}
        <div className="mt-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200/50">
            <div className="text-sm font-medium text-blue-900 mb-1">Need Help?</div>
            <div className="text-xs text-blue-700 mb-3">
              Access mentor resources and guides
            </div>
            <button className="w-full bg-white text-blue-600 text-sm font-medium py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors duration-200">
              View Resources
            </button>
          </div>
        </div>
      </nav>

      {/* Snackbar */}
      {snackbar.open && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {snackbar.message}
          <button 
            onClick={closeSnackbar}
            className="ml-4 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      )}
    </aside>
  );
}
