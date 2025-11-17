'use client';

import { CommunityPost } from '@/types/community';
import { useState } from 'react';

interface AdminStatsProps {
  posts: CommunityPost[];
}

export default function AdminStats({ posts }: AdminStatsProps) {
  const [activeView, setActiveView] = useState<'overview' | 'categories' | 'visibility'>('overview');

  // Calculate all statistics
  const totalPosts = posts.length;
  const totalReplies = posts.reduce((total, post) => total + post.replies.length, 0);
  const totalUpvotes = posts.reduce((total, post) => total + post.upvotes.length, 0);
  const totalReports = posts.reduce((total, post) => total + post.reportCount, 0);
  const deletedPosts = posts.filter(post => post.isDeleted).length;
  const activePosts = totalPosts - deletedPosts;

  // Count by category
  const categoryStats = {
    'higher-education': posts.filter(post => post.category === 'higher-education').length,
    'market-trends': posts.filter(post => post.category === 'market-trends').length,
    'domains': posts.filter(post => post.category === 'domains').length,
    'placements': posts.filter(post => post.category === 'placements').length,
    'general': posts.filter(post => post.category === 'general').length,
    'academic': posts.filter(post => post.category === 'academic').length,
    'career': posts.filter(post => post.category === 'career').length,
    'technical': posts.filter(post => post.category === 'technical').length,
    'announcement': posts.filter(post => post.category === 'announcement').length,
  };

  // Count by visibility
  const visibilityStats = {
    public: posts.filter(post => post.visibility === 'public').length,
    students: posts.filter(post => post.visibility === 'students').length,
    mentors: posts.filter(post => post.visibility === 'mentors').length,
    'admin-mentors': posts.filter(post => post.visibility === 'admin-mentors').length,
  };

  // Count by user role
  const userRoleStats = {
    student: posts.filter(post => post.userRole === 'student').length,
    mentor: posts.filter(post => post.userRole === 'mentor').length,
    admin: posts.filter(post => post.userRole === 'admin').length,
    moderator: posts.filter(post => post.userRole === 'moderator').length
  };

  // Recent activity (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const recentPosts = posts.filter(post => new Date(post.createdAt) > oneWeekAgo).length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      {/* View Toggle */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveView('overview')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeView === 'overview'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveView('categories')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeView === 'categories'
              ? 'text-green-600 border-b-2 border-green-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🏷️ Categories
        </button>
        <button
          onClick={() => setActiveView('visibility')}
          className={`pb-3 px-4 font-medium transition-colors ${
            activeView === 'visibility'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          👥 Visibility
        </button>
      </div>

      {/* Overview View */}
      {activeView === 'overview' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {/* Key Metrics */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="text-blue-600 text-sm font-semibold mb-1">Total Posts</div>
            <div className="text-2xl font-bold text-blue-700">{totalPosts}</div>
            <div className="text-blue-600 text-xs mt-1">
              {recentPosts} this week
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="text-green-600 text-sm font-semibold mb-1">Total Replies</div>
            <div className="text-2xl font-bold text-green-700">{totalReplies}</div>
            <div className="text-green-600 text-xs mt-1">
              Engagement
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="text-orange-600 text-sm font-semibold mb-1">Total Upvotes</div>
            <div className="text-2xl font-bold text-orange-700">{totalUpvotes}</div>
            <div className="text-orange-600 text-xs mt-1">
              Community feedback
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border border-red-200">
            <div className="text-red-600 text-sm font-semibold mb-1">Reports</div>
            <div className="text-2xl font-bold text-red-700">{totalReports}</div>
            <div className="text-red-600 text-xs mt-1">
              Needs attention
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="text-purple-600 text-sm font-semibold mb-1">Active Posts</div>
            <div className="text-2xl font-bold text-purple-700">{activePosts}</div>
            <div className="text-purple-600 text-xs mt-1">
              {deletedPosts} deleted
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="text-gray-600 text-sm font-semibold mb-1">User Roles</div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>👨‍🎓 Students:</span>
                <span className="font-semibold">{userRoleStats.student}</span>
              </div>
              <div className="flex justify-between">
                <span>👨‍🏫 Mentors:</span>
                <span className="font-semibold">{userRoleStats.mentor}</span>
              </div>
              <div className="flex justify-between">
                <span>👑 Admins:</span>
                <span className="font-semibold">{userRoleStats.admin}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories View */}
      {activeView === 'categories' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(categoryStats).map(([category, count]) => (
            <div key={category} className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
              <div className="text-green-600 text-sm font-semibold mb-1 capitalize">
                {category.replace('-', ' ')}
              </div>
              <div className="text-2xl font-bold text-green-700">{count}</div>
              <div className="text-green-600 text-xs mt-1">
                {totalPosts > 0 ? Math.round((count / totalPosts) * 100) : 0}%
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Visibility View */}
      {activeView === 'visibility' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(visibilityStats).map(([visibility, count]) => {
            const getVisibilityConfig = (vis: string) => {
              switch (vis) {
                case 'public':
                  return { color: 'blue', label: '🌍 Public', description: 'Everyone' };
                case 'students':
                  return { color: 'green', label: '👥 Students', description: 'Students only' };
                case 'mentors':
                  return { color: 'purple', label: '👨‍🏫 Mentors', description: 'Mentors only' };
                case 'admin-mentors':
                  return { color: 'red', label: '🔒 Admin-Mentor', description: 'Private chat' };
                default:
                  return { color: 'gray', label: vis, description: '' };
              }
            };

            const config = getVisibilityConfig(visibility);
            
            return (
              <div key={visibility} className={`bg-gradient-to-br from-${config.color}-50 to-${config.color}-100 p-4 rounded-lg border border-${config.color}-200`}>
                <div className={`text-${config.color}-600 text-sm font-semibold mb-1`}>
                  {config.label}
                </div>
                <div className={`text-2xl font-bold text-${config.color}-700`}>{count}</div>
                <div className={`text-${config.color}-600 text-xs mt-1`}>
                  {config.description}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}