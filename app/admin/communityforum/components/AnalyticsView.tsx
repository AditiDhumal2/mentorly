'use client';

import { CommunityPost } from '@/types/community';

interface AnalyticsViewProps {
  posts: CommunityPost[];
}

export default function AnalyticsView({ posts }: AnalyticsViewProps) {
  // Calculate engagement metrics
  const totalPosts = posts.length;
  const totalReplies = posts.reduce((total, post) => total + post.replies.length, 0);
  const totalUpvotes = posts.reduce((total, post) => total + post.upvotes.length, 0);
  
  const engagementRate = totalPosts > 0 ? (totalReplies + totalUpvotes) / totalPosts : 0;
  
  // Activity by day (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  const dailyActivity = last7Days.map(date => {
    const postsCount = posts.filter(post => 
      post.createdAt.split('T')[0] === date
    ).length;
    return { date, posts: postsCount };
  });

  // Most active users
  const userActivity = posts.reduce((acc: any, post) => {
    if (!acc[post.userId]) {
      acc[post.userId] = { 
        name: post.userName, 
        role: post.userRole, 
        posts: 0, 
        replies: post.replies.length 
      };
    }
    acc[post.userId].posts += 1;
    return acc;
  }, {});

  const topUsers = Object.values(userActivity)
    .sort((a: any, b: any) => (b.posts + b.replies) - (a.posts + a.replies))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-blue-600 mb-2">{totalPosts}</div>
          <div className="text-gray-600 font-medium">Total Posts</div>
          <div className="text-sm text-gray-500 mt-1">All time content</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-green-600 mb-2">{totalReplies}</div>
          <div className="text-gray-600 font-medium">Total Replies</div>
          <div className="text-sm text-gray-500 mt-1">Community interactions</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-orange-600 mb-2">{engagementRate.toFixed(1)}</div>
          <div className="text-gray-600 font-medium">Engagement Rate</div>
          <div className="text-sm text-gray-500 mt-1">Replies & upvotes per post</div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <div className="text-2xl font-bold text-purple-600 mb-2">{topUsers.length}</div>
          <div className="text-gray-600 font-medium">Active Users</div>
          <div className="text-sm text-gray-500 mt-1">Top contributors</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Activity (Last 7 Days)</h3>
          <div className="space-y-2">
            {dailyActivity.map(({ date, posts }) => (
              <div key={date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{new Date(date).toLocaleDateString()}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(posts / Math.max(...dailyActivity.map(d => d.posts))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium w-8">{posts}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🏆 Top Contributors</h3>
          <div className="space-y-3">
            {topUsers.map((user: any, index) => (
              <div key={user.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-800">{user.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-800">{user.posts} posts</div>
                  <div className="text-xs text-gray-500">{user.replies} replies</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🏷️ Content Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { name: 'General', count: posts.filter(p => p.category === 'general').length, color: 'gray' },
            { name: 'Academic', count: posts.filter(p => p.category === 'academic').length, color: 'blue' },
            { name: 'Career', count: posts.filter(p => p.category === 'career').length, color: 'green' },
            { name: 'Technical', count: posts.filter(p => p.category === 'technical').length, color: 'orange' },
            { name: 'Announcements', count: posts.filter(p => p.category === 'announcement').length, color: 'purple' },
            { name: 'Mentor Q&A', count: posts.filter(p => p.category === 'mentor-question').length, color: 'red' }
          ].map(({ name, count, color }) => (
            <div key={name} className="text-center p-4 bg-gray-50 rounded-lg">
              <div className={`text-2xl font-bold text-${color}-600 mb-1`}>{count}</div>
              <div className="text-sm text-gray-600">{name}</div>
              <div className="text-xs text-gray-500">
                {totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}