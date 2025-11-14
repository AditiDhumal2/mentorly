'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  MessageSquare,
  Users,
  Calendar,
  UserCircle,
  LogOut,
  ChevronRight,
  CheckCircle
} from 'lucide-react';
import { mentorLogout } from '@/app/mentors-auth/login/actions/mentor-login.actions';

const menuItems = [
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
    requiresApproval: false // Allow profile editing anytime
  }
];

interface MentorMenuProps {
  stats?: {
    totalSessions: number;
    rating: number;
  };
}

export default function MentorMenu({ stats }: MentorMenuProps) {
  const pathname = usePathname();

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
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 border ${
                    active 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 shadow-sm' 
                      : 'border-transparent hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        active 
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-md' 
                          : 'bg-gradient-to-br from-blue-100 to-purple-100 group-hover:from-blue-200 group-hover:to-purple-200 text-blue-600'
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {active && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`font-medium transition-colors duration-200 text-sm ${
                        active ? 'text-blue-900' : 'text-gray-900 group-hover:text-blue-700'
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-xs transition-colors duration-200 ${
                        active ? 'text-blue-600' : 'text-gray-500 group-hover:text-blue-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 ${
                    active 
                      ? 'text-blue-500 translate-x-0.5' 
                      : 'text-gray-400 group-hover:text-blue-500 group-hover:translate-x-0.5'
                  }`} />
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
    </aside>
  );
}