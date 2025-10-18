// app/admin/(dashboard)/components/AdminMenu.tsx
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
  ChevronRight
} from 'lucide-react';

const menuItems = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  { 
    name: 'Students', 
    href: '/admin/students', 
    icon: Users,
    description: 'Manage student accounts'
  },
  { 
    name: 'Roadmaps', 
    href: '/admin/roadmaps', 
    icon: Map,
    description: 'Learning path management'
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
    href: '/admin/domains', 
    icon: Target,
    description: 'Career categories'
  },
  { 
    name: 'System Settings', 
    href: '/admin/settings', 
    icon: Settings,
    description: 'Platform configuration'
  }
];

export default function AdminMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-80 flex-shrink-0">
      <nav className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm p-6 border border-gray-200/60 hover:shadow-lg transition-all duration-300">
        {/* Sidebar Header */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your platform</p>
        </div>

        {/* Menu Items */}
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const active = isActive(item.href);
            
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex items-center justify-between p-4 rounded-xl transition-all duration-200 border ${
                    active 
                      ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 shadow-sm' 
                      : 'border-transparent hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 hover:border-purple-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        active 
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-md' 
                          : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200 text-purple-600'
                      }`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {/* Active indicator dot */}
                      {active && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full shadow-sm"></div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className={`font-medium transition-colors duration-200 ${
                        active ? 'text-purple-900' : 'text-gray-900 group-hover:text-purple-700'
                      }`}>
                        {item.name}
                      </div>
                      <div className={`text-xs transition-colors duration-200 ${
                        active ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'
                      }`}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                    active 
                      ? 'text-purple-500 translate-x-1' 
                      : 'text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1'
                  }`} />
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Sidebar Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200/60">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200/50">
            <div className="text-sm font-medium text-purple-900">Need help?</div>
            <div className="text-xs text-purple-700 mt-1">Check our documentation</div>
            <button className="mt-3 w-full bg-white text-purple-600 text-xs font-medium py-2 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors duration-200">
              View Guides
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
}