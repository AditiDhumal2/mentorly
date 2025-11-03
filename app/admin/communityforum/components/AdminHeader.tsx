interface AdminHeaderProps {
  filteredPostsCount: number;
  totalPostsCount: number;
}

export default function AdminHeader({ filteredPostsCount, totalPostsCount }: AdminHeaderProps) {
  return (
    <div className="mb-8">
      {/* Enhanced Header with Pinkish-Violet Gradient */}
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden p-8 mb-6">
        {/* Background Pattern */}
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
                  Community Forum - Admin
                </h1>
                <p className="text-purple-100 text-lg font-medium">
                  Manage community posts and replies. Delete inappropriate content.
                </p>
              </div>
            </div>
            
            {/* Stats Card */}
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30 min-w-[200px]">
              <div className="text-white text-sm font-medium mb-1">Content Overview</div>
              <div className="text-white font-bold text-lg">
                {filteredPostsCount} of {totalPostsCount} posts
              </div>
              <div className="text-purple-100 text-sm">
                {Math.round((filteredPostsCount / totalPostsCount) * 100)}% visible
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Notice - Updated with matching colors */}
      <div className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl shadow-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
            <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-purple-800 font-semibold text-lg mb-1">
              Admin Notice
            </h3>
            <p className="text-purple-700 text-sm leading-relaxed">
              Use this panel to moderate community content. Deleting posts or replies is permanent 
              and cannot be undone. Always review content carefully before deletion. Consider 
              warning users before taking permanent actions when appropriate.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100">
          <div className="text-purple-600 font-bold text-xl mb-1">
            {totalPostsCount}
          </div>
          <div className="text-purple-700 font-medium text-xs">Total Posts</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-pink-100">
          <div className="text-pink-600 font-bold text-xl mb-1">
            {filteredPostsCount}
          </div>
          <div className="text-pink-700 font-medium text-xs">Filtered Posts</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-fuchsia-100">
          <div className="text-fuchsia-600 font-bold text-xl mb-1">
            {totalPostsCount - filteredPostsCount}
          </div>
          <div className="text-fuchsia-700 font-medium text-xs">Hidden Posts</div>
        </div>
        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-rose-100">
          <div className="text-rose-600 font-bold text-xl mb-1">
            {Math.round((filteredPostsCount / totalPostsCount) * 100)}%
          </div>
          <div className="text-rose-700 font-medium text-xs">Content Visible</div>
        </div>
      </div>
    </div>
  );
}