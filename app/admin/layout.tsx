import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/actions/adminAuthActions';
import { LogOut, Eye, Shield } from 'lucide-react';
import AdminMenu from './components/AdminMenu';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const user = await getCurrentUser();

  // Only authenticated admins can access dashboard routes
  if (!user || user.role !== 'admin') {
    // Add cache busting parameter to prevent back button issues
    redirect('/admin-login?t=' + Date.now());
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Enhanced header with security indicators */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href={`/admin?t=${Date.now()}`} 
                className="flex items-center space-x-3 group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Mentorly
                  </span>
                  <span className="text-xs text-gray-500 block -mt-1">Admin Panel • Secure</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-3 bg-white/50 rounded-xl px-3 py-2 border border-gray-200/60">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                    Administrator
                  </div>
                </div>
              </div>
              
              <Link
                href={`/students-dashboard?t=${Date.now()}`}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 hover:bg-white/50 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200/60"
              >
                <Eye className="w-4 h-4" />
                <span>Student View</span>
              </Link>
              
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          <AdminMenu />
          <main className="flex-1 min-w-0">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-200/60 min-h-[600px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}