export default async function StudentsDashboardPage() {
  // No auth check needed here - layout handles it automatically

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
        <p className="text-blue-100">
          Ready to continue your learning journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Academic Progress</h3>
          <p className="text-2xl font-bold text-blue-600">Year 1</p>
          <p className="text-gray-600 text-sm">Current academic year</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Path</h3>
          <p className="text-2xl font-bold text-green-600">0%</p>
          <p className="text-gray-600 text-sm">Roadmap completion</p>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Career Readiness</h3>
          <p className="text-2xl font-bold text-purple-600">0%</p>
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
    </div>
  );
}

export const dynamic = 'force-dynamic';