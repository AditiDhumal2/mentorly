'use client';

import { useState, useEffect } from 'react';
import { CommunityPost, Moderator } from '@/types/community';
import ModeratorPostCard from './ModeratorPostCard';

interface ModeratorCommunityForumProps {
  initialPosts: CommunityPost[];
  currentUser: any;
  moderator: Moderator;
}

const CATEGORY_NAMES: { [key: string]: string } = {
  'higher-education': 'Higher Education',
  'market-trends': 'Market Trends',
  'domains': 'Domains & Specializations',
  'placements': 'Placements & Careers',
  'general': 'General Discussion',
  'academic': 'Academic Help',
  'career': 'Career Advice',
  'technical': 'Technical Help',
  'announcement': 'Announcements'
};

export default function ModeratorCommunityForum({ 
  initialPosts, 
  currentUser,
  moderator 
}: ModeratorCommunityForumProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredPosts = selectedCategory === 'all' 
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const handlePostDeleted = (postId: string) => {
    setPosts(prev => prev.filter(post => post._id !== postId));
  };

  const handleReplyDelete = (postId: string, replyId: string) => {
    setPosts(prev => prev.map(post => {
      if (post._id === postId) {
        return {
          ...post,
          replies: post.replies.filter(reply => reply._id !== replyId)
        };
      }
      return post;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Moderator Dashboard</h1>
              <p className="text-gray-600 mb-4">
                Manage content in your assigned categories
              </p>
              <div className="flex items-center space-x-4 text-sm">
                <div>
                  <span className="font-medium">Moderator:</span> {currentUser.name}
                </div>
                <div>
                  <span className="font-medium">Role:</span> 
                  <span className="ml-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {currentUser.role} Moderator
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Assigned Categories</div>
              <div className="flex flex-wrap gap-1 justify-end">
                {moderator.assignedCategories.map(category => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full border border-green-200"
                  >
                    {CATEGORY_NAMES[category]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Filter by Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              {moderator.assignedCategories.map(category => (
                <option key={category} value={category}>
                  {CATEGORY_NAMES[category]}
                </option>
              ))}
            </select>
            <span className="text-sm text-gray-500">
              {filteredPosts.length} posts
            </span>
          </div>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {filteredPosts.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Posts Found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'No posts in your assigned categories yet.'
                  : `No posts in ${CATEGORY_NAMES[selectedCategory]} category.`
                }
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <ModeratorPostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onPostDeleted={handlePostDeleted}
                onReplyDelete={handleReplyDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}