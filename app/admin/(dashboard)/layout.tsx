// app/admin/(dashboard)/layout.tsx (Dashboard layout with menu)
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { adminLogout } from '@/actions/adminAuthActions';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: AdminDashboardLayoutProps) {
  const user = await getCurrentUser();

  // Only authenticated admins can access dashboard routes
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  const adminMenuItems = [
    { name: 'Dashboard', href: '/admin' },
    { name: 'Students', href: '/admin/students' },
    { name: 'Roadmaps', href: '/admin/roadmaps' },
    { name: 'Resources', href: '/admin/resources' },
    { name: 'Market Trends', href: '/admin/trends' },
    { name: 'Career Domains', href: '/admin/domains' },
    { name: 'System Settings', href: '/admin/settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold text-gray-900">
                  Mentorly Admin
                </span>
              </Link>
              <nav className="ml-8 flex space-x-1">
                {adminMenuItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">Administrator</div>
                </div>
              </div>
              
              <Link
                href="/dashboard"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Student View
              </Link>
              
              <form action={adminLogout}>
                <button
                  type="submit"
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}