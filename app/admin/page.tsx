import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import DashboardLayout from '../dashboard/components/DashboardLayout';

// Define user type for better typing
interface UserData {
  _id: string;
  role: string;
  name: string;
  email: string;
  year?: number;
  college?: string;
}

// Define the proper type for DashboardLayout user
interface DashboardUser {
  name: string;
  email: string;
  year: number;
  college: string;
  role: 'student' | 'mentor' | 'admin';
}

// Get user data for the layout
async function getUserData(userId: string): Promise<DashboardUser> {
  try {
    await connectDB();
    const userDoc = await User.findById(userId).select('-password').lean();
    
    if (!userDoc) {
      throw new Error('User not found');
    }

    const user = userDoc as any;

    // Ensure role is one of the allowed values
    const validRole = user.role === 'mentor' || user.role === 'admin' ? user.role : 'student';

    return {
      name: user.name || 'User',
      email: user.email || '',
      year: user.year || 1,
      college: user.college || 'Unknown College',
      role: validRole
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Return default user with proper role type
    return {
      name: 'User',
      email: '',
      year: 1,
      college: 'Unknown College',
      role: 'student' as const
    };
  }
}

// Check if user has admin access
async function checkAdminAccess(): Promise<boolean> {
  try {
    await connectDB();
    
    // Get your user by ID (replace with session-based auth later)
    const user = await User.findById('68e77f7e4da2142915e863e6').select('role').lean() as unknown as UserData;
    
    if (!user) {
      return false;
    }

    return user.role === 'admin' || user.role === 'mentor';
  } catch (error) {
    console.error('Error checking admin access:', error);
    return false;
  }
}

// Simple Admin Dashboard component (temporary)
function SimpleAdminDashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-gray-300">Welcome to the admin panel! Manage your platform content and users.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { 
            title: 'Roadmaps', 
            href: '/admin/roadmaps', 
            icon: '🗺️',
            description: 'Manage learning roadmaps and content',
            bgColor: 'from-blue-600/20 to-cyan-600/20',
            borderColor: 'border-blue-400/30'
          },
          { 
            title: 'Career Domains', 
            href: '/admin/domains', 
            icon: '💼',
            description: 'Edit career domains and categories',
            bgColor: 'from-green-600/20 to-emerald-600/20',
            borderColor: 'border-green-400/30'
          },
          { 
            title: 'Market Trends', 
            href: '/admin/trends', 
            icon: '📈',
            description: 'Update industry trends and insights',
            bgColor: 'from-purple-600/20 to-indigo-600/20',
            borderColor: 'border-purple-400/30'
          },
          { 
            title: 'Resources', 
            href: '/admin/resources', 
            icon: '📚',
            description: 'Manage learning resources and materials',
            bgColor: 'from-orange-600/20 to-amber-600/20',
            borderColor: 'border-orange-400/30'
          },
          { 
            title: 'Users', 
            href: '/admin/users', 
            icon: '👥',
            description: 'View and manage user accounts',
            bgColor: 'from-pink-600/20 to-rose-600/20',
            borderColor: 'border-pink-400/30'
          },
          { 
            title: 'Community', 
            href: '/admin/community', 
            icon: '💬',
            description: 'Moderate community content',
            bgColor: 'from-teal-600/20 to-cyan-600/20',
            borderColor: 'border-teal-400/30'
          },
        ].map((section) => (
          <div 
            key={section.href} 
            className={`bg-gradient-to-br ${section.bgColor} backdrop-blur-lg rounded-2xl p-6 border ${section.borderColor} hover:scale-105 transition-all duration-300 hover:shadow-xl`}
          >
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">{section.icon}</span>
              <h3 className="text-lg font-semibold text-white">{section.title}</h3>
            </div>
            <p className="text-gray-300 text-sm mb-4">{section.description}</p>
            <a 
              href={section.href} 
              className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg border border-white/30 hover:bg-white/30 transition-colors text-sm font-medium"
            >
              Manage Section
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        ))}
      </div>

      {/* Quick Stats Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">1,234</div>
            <div className="text-gray-400 text-sm">Total Users</div>
          </div>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">56</div>
            <div className="text-gray-400 text-sm">Active Roadmaps</div>
          </div>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">89%</div>
            <div className="text-gray-400 text-sm">Completion Rate</div>
          </div>
        </div>
        <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-2">24</div>
            <div className="text-gray-400 text-sm">New This Week</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60">
        <h3 className="text-xl font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'New user registered', time: '2 minutes ago', user: 'John Doe' },
            { action: 'Roadmap completed', time: '1 hour ago', user: 'Sarah Smith' },
            { action: 'Resource added', time: '3 hours ago', user: 'Admin' },
            { action: 'Career domain updated', time: '5 hours ago', user: 'Admin' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
              <div>
                <span className="text-white font-medium">{activity.action}</span>
                <span className="text-gray-400 ml-2">by {activity.user}</span>
              </div>
              <span className="text-gray-400 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AdminPage() {
  const hasAccess = await checkAdminAccess();

  if (!hasAccess) {
    redirect('/dashboard');
  }

  // Get user data for the layout
  // Using the same user ID as in checkAdminAccess for consistency
  const userData = await getUserData('68e77f7e4da2142915e863e6');

  return (
    <DashboardLayout user={userData}>
      <SimpleAdminDashboard />
    </DashboardLayout>
  );
}