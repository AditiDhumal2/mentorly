// app/students/page.tsx
import { getCurrentUser, getUserProgress } from '../../actions/userActions';
import { cookies } from 'next/headers';

export default async function StudentsDashboardPage() {
  // DEBUG: Check cookies before getCurrentUser
  const cookieStore = await cookies();
  const cookiesBefore = cookieStore.getAll();
  console.log('🔍 STUDENT PAGE - Cookies BEFORE getCurrentUser:', cookiesBefore.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    valueLength: c.value?.length || 0
  })));

  // Fetch actual user data
  const user = await getCurrentUser();
  
  // DEBUG: Check cookies after getCurrentUser
  const cookiesAfter = cookieStore.getAll();
  console.log('🔍 STUDENT PAGE - Cookies AFTER getCurrentUser:', cookiesAfter.map(c => ({
    name: c.name,
    hasValue: !!c.value,
    valueLength: c.value?.length || 0
  })));

  // Only fetch progress if user exists and has a valid ID
  let progress;
  if (user?._id) {
    progress = await getUserProgress(user._id);
  } else {
    // Default progress when no user is found
    progress = {
      roadmapProgress: 0,
      brandingProgress: 0,
      savedResources: 0,
      recentActivity: [
        { type: 'welcome', title: 'Welcome to CareerCompanion', time: 'Just now' },
      ],
    };
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section with actual user name */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-blue-100">
          Ready to continue your learning journey at {user?.college || 'your college'}
        </p>
      </div>

      {/* Stats Grid with real progress data */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Progress</h3>
          <p className="text-2xl font-bold text-blue-600">Year {user?.year || '1'}</p>
          <p className="text-gray-600 text-sm">Current academic year</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Path</h3>
          <p className="text-2xl font-bold text-green-600">{progress.roadmapProgress}%</p>
          <p className="text-gray-600 text-sm">Roadmap completion</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Readiness</h3>
          <p className="text-2xl font-bold text-purple-600">{progress.brandingProgress}%</p>
          <p className="text-gray-600 text-sm">Branding progress</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
            <div className="text-blue-600 text-lg mb-2">📚</div>
            <p className="text-sm font-medium text-gray-900">My Courses</p>
          </button>
          
          <button className="p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
            <div className="text-green-600 text-lg mb-2">🗺️</div>
            <p className="text-sm font-medium text-gray-900">Roadmap</p>
          </button>
          
          <button className="p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors">
            <div className="text-purple-600 text-lg mb-2">💼</div>
            <p className="text-sm font-medium text-gray-900">Placement</p>
          </button>
          
          <button className="p-4 bg-orange-50 rounded-lg border border-orange-200 hover:bg-orange-100 transition-colors">
            <div className="text-orange-600 text-lg mb-2">📊</div>
            <p className="text-sm font-medium text-gray-900">Progress</p>
          </button>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {progress.recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'roadmap' ? 'bg-green-500' :
                activity.type === 'branding' ? 'bg-purple-500' :
                activity.type === 'account' ? 'bg-blue-500' : 'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export const dynamic = 'force-dynamic';