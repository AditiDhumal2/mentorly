'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  BookOpen, 
  TrendingUp, 
  Target, 
  Settings,
  MessageSquare,
  ChevronRight,
  LogOut,
  BadgeCheck,
  Briefcase,
  GraduationCap,
  UserCheck,
  ShieldCheck,
  Menu,
  X,
  Shield
} from 'lucide-react';
import AdminLogout from './AdminLogout';
import { useState } from 'react';

const menuItems = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  { 
    name: 'Verify Mentors', 
    href: '/admin/verifymentor', 
    icon: ShieldCheck,
    description: 'Approve mentors'
  },
  { 
    name: 'Moderators', 
    href: '/admin/moderators', 
    icon: Shield,
    description: 'Community moderators'
  },
  { 
    name: 'Roadmaps', 
    href: '/admin/roadmaps', 
    icon: Map,
    description: 'Learning paths'
  },
  { 
    name: 'Resources', 
    href: '/admin/resources', 
    icon: BookOpen,
    description: 'Educational materials'
  },
  { 
    name: 'Market Trends', 
    href: '/admin/trends', 
    icon: TrendingUp,
    description: 'Industry insights'
  },
  { 
    name: 'Career Domains', 
    href: '/admin/careerdomains', 
    icon: Target,
    description: 'Career categories'
  },
  { 
    name: 'Placement Hub', 
    href: '/admin/placementhub', 
    icon: Briefcase,
    description: 'Interview prep'
  },
  { 
    name: 'Branding', 
    href: '/admin/professionalbranding', 
    icon: BadgeCheck,
    description: 'Professional branding'
  },
  { 
    name: 'Community', 
    href: '/admin/communityforum', 
    icon: MessageSquare,
    description: 'Moderate discussions'
  },
  { 
    name: 'Education', 
    href: '/admin/highereducation', 
    icon: GraduationCap,
    description: 'Study abroad'
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'Platform config'
  }
];

export default function AdminMenu() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  // Compact version - icons only with tooltips on hover
  if (isCollapsed) {
    return (
      <aside className="w-20 flex-shrink-0">
        <nav className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-4 border border-gray-200/60 h-full flex flex-col">
          {/* Collapsed Header */}
          <div className="mb-6 flex justify-center">
            <button
              onClick={() => setIsCollapsed(false)}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-600 flex items-center justify-center transition-all duration-200 hover:shadow-sm"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Compact Menu Items */}
          <ul className="space-y-3 flex-1">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              const active = isActive(item.href);
              
              return (
                <li key={item.name} className="relative">
                  <Link
                    href={item.href}
                    className={`group w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md' 
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 text-purple-600 hover:shadow-sm'
                    }`}
                    title={item.name}
                  >
                    <IconComponent className="w-5 h-5" />
                    
                    {/* Active indicator */}
                    {active && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-500 rounded-full"></div>
                    )}
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.name}
                      <div className="text-gray-300 text-xs mt-1">{item.description}</div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Compact Logout */}
          <div className="mt-4 pt-4 border-t border-gray-200/60">
            <div className="flex justify-center">
              <AdminLogout variant="icon" />
            </div>
          </div>
        </nav>
      </aside>
    );
  }

  // Regular compact version
  return (
    <aside className="w-64 flex-shrink-0">
      <nav className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-4 border border-gray-200/60 h-full flex flex-col">
        {/* Header with collapse button */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Admin</h2>
            <p className="text-xs text-gray-500 mt-1">Platform Management</p>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Compact Menu Items */}
        <ul className="space-y-1.5 flex-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200' 
                      : 'border border-transparent hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      active 
                        ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-sm' 
                        : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 text-purple-600'
                    }`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="text-left min-w-0 flex-1">
                      <div className="flex items-center space-x-2">
                        <div className={`font-medium text-sm transition-colors duration-200 truncate ${
                          active ? 'text-purple-900' : 'text-gray-900 group-hover:text-purple-700'
                        }`}>
                          {item.name}
                        </div>
                      </div>
                      <div className={`text-xs transition-colors duration-200 truncate ${
                        active ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-3 h-3 transition-all duration-200 flex-shrink-0 ${
                    active 
                      ? 'text-purple-500 translate-x-0.5' 
                      : 'text-gray-400 group-hover:text-purple-500 group-hover:translate-x-0.5'
                  }`} />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Compact Logout Section */}
        <div className="mt-4 pt-4 border-t border-gray-200/60">
          <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200/60 bg-white/50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 flex items-center justify-center text-red-600">
                <LogOut className="w-3 h-3" />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium text-gray-900">Admin</div>
                <div className="text-xs text-gray-500">Sign out</div>
              </div>
            </div>
            <AdminLogout variant="minimal" />
          </div>
        </div>

        {/* Compact Help Section */}
        <div className="mt-3">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-3 border border-purple-200/50">
            <div className="text-sm font-medium text-purple-900">Help</div>
            <button className="mt-2 w-full bg-white text-purple-600 text-xs font-medium py-1.5 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors duration-200">
              Guides
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}