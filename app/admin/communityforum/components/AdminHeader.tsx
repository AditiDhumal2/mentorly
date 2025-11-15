interface AdminHeaderProps {
  filteredPostsCount: number;
  totalPostsCount: number;
  activeTab: 'all-posts' | 'admin-mentors' | 'reported' | 'analytics';
  onTabChange: (tab: 'all-posts' | 'admin-mentors' | 'reported' | 'analytics') => void;
  allPostsCount: number;
  adminMentorsCount: number;
  reportedPostsCount: number;
  onNewPost: () => void;
  currentUser: any;
  stats: {
    totalReports: number;
    recentActivity: number;
    engagementRate: number;
  };
}

export default function AdminHeader({ 
  filteredPostsCount, 
  totalPostsCount, 
  activeTab, 
  onTabChange,
  allPostsCount,
  adminMentorsCount,
  reportedPostsCount,
  onNewPost,
  currentUser,
  stats
}: AdminHeaderProps) {
  return (
    <div className="mb-8">
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-xl overflow-hidden p-8 mb-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                  <span className="text-2xl">⚙️</span>
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  Community Management
                </h1>
                <p className="text-blue-100 text-lg font-medium">
                  Monitor, moderate, and manage community interactions
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 min-w-[300px]">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                <div className="text-white text-sm font-medium">Content</div>
                <div className="text-white font-bold text-lg">{totalPostsCount}</div>
                <div className="text-blue-100 text-xs">posts</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                <div className="text-white text-sm font-medium">Reports</div>
                <div className="text-white font-bold text-lg">{stats.totalReports}</div>
                <div className="text-blue-100 text-xs">to review</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 border border-white/30 text-center">
                <div className="text-white text-sm font-medium">Active</div>
                <div className="text-white font-bold text-lg">{stats.recentActivity}</div>
                <div className="text-blue-100 text-xs">this week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => onTabChange('all-posts')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'all-posts'
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            🌍 All Content
            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
              {allPostsCount}
            </span>
          </button>
          <button
            onClick={() => onTabChange('admin-mentors')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'admin-mentors'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            🔒 Admin-Mentor
            <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
              {adminMentorsCount}
            </span>
          </button>
          <button
            onClick={() => onTabChange('reported')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'reported'
                ? 'text-red-600 border-b-2 border-red-600 bg-red-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            ⚠️ Reported
            <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
              {reportedPostsCount}
            </span>
          </button>
          <button
            onClick={() => onTabChange('analytics')}
            className={`flex-1 py-4 px-4 text-center font-medium ${
              activeTab === 'analytics'
                ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            📈 Analytics
            <span className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
              Insights
            </span>
          </button>
        </div>
      </div>

      {/* Quick Actions - Only show New Post button for admin-mentors tab */}
      <div className="flex justify-end mb-6">
        {activeTab === 'admin-mentors' && currentUser && (
          <button
            onClick={onNewPost}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-semibold flex items-center space-x-2"
          >
            <span>💬</span>
            <span>New Admin-Mentor Chat</span>
          </button>
        )}
      </div>
    </div>
  );
}