'use client';

import { useState, useEffect, useCallback } from 'react';
import { CommunityPost, Moderator } from '@/types/community';
import ModeratorPostCard from './ModeratorPostCard';
import { getModeratorByUserId, getModeratorPosts } from '@/actions/moderator-actions';

interface ModeratorCommunityForumProps {
  currentUser: any;
  initialPosts?: CommunityPost[];
  moderator?: Moderator;
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
  currentUser,
  initialPosts = [],
  moderator: initialModerator
}: ModeratorCommunityForumProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [moderator, setModerator] = useState<Moderator | null>(initialModerator || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(!initialModerator || initialPosts.length === 0);

  // Use useCallback to memoize the function and prevent infinite re-renders
  const loadModeratorData = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading moderator data...');
      
      const modData = await getModeratorByUserId(currentUser._id);
      
      if (modData) {
        setModerator(modData);
        const moderatorPosts = await getModeratorPosts(currentUser._id);
        // Ensure posts have the new fields
        const postsWithNewFields = moderatorPosts.map(post => ({
          ...post,
          edited: post.edited || false,
          editCount: post.editCount || 0
        }));
        setPosts(postsWithNewFields);
        console.log('✅ Moderator data loaded successfully');
      }
    } catch (error) {
      console.error('Error loading moderator data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser._id]); // Only recreate if currentUser._id changes

  useEffect(() => {
    console.log('🔍 useEffect running - checking if need to fetch data');
    console.log('Initial moderator:', !!initialModerator);
    console.log('Initial posts count:', initialPosts.length);
    
    // If moderator or posts weren't provided, fetch them
    if (!initialModerator || initialPosts.length === 0) {
      console.log('📥 Fetching moderator data from client...');
      loadModeratorData();
    } else {
      console.log('✅ Using server-provided data, no fetch needed');
      setLoading(false);
    }
  }, [loadModeratorData, initialModerator, initialPosts.length]); // Add initialPosts.length

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

  // Add a refresh function for manual updates
  const handleRefresh = async () => {
    await loadModeratorData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
            <p className="text-gray-600">Loading moderator dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!moderator) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔒</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Moderator Access Required</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You don't have moderator privileges. Please contact an administrator if you believe this is an error.
            </p>
            <div className="flex justify-center space-x-4">
              {currentUser.role === 'student' && (
                <a
                  href="/students/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Student Dashboard
                </a>
              )}
              {currentUser.role === 'mentor' && (
                <a
                  href="/mentors/dashboard"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Go to Mentor Dashboard
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-lg shadow-sm border border-orange-200 p-6 mb-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">🛡️ Moderator Dashboard</h1>
              <p className="text-orange-100 mb-4">
                Manage content in your assigned categories
              </p>
              <div className="flex items-center space-x-4 text-sm text-orange-100">
                <div>
                  <span className="font-medium">Moderator:</span> {currentUser.name}
                </div>
                <div>
                  <span className="font-medium">Role:</span> 
                  <span className="ml-1 px-2 py-1 bg-white/20 text-white text-xs rounded-full">
                    {currentUser.role} Moderator
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-orange-100 text-sm mb-1">Assigned Categories</div>
              <div className="flex flex-wrap gap-1 justify-end">
                {moderator.assignedCategories.map(category => (
                  <span
                    key={category}
                    className="px-2 py-1 bg-white/20 text-white text-xs rounded-full border border-white/30"
                  >
                    {CATEGORY_NAMES[category]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600 mb-2">{posts.length}</div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {posts.filter(p => p.reportCount > 0).length}
            </div>
            <div className="text-gray-600">Reported Posts</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {posts.reduce((total, post) => total + post.replies.length, 0)}
            </div>
            <div className="text-gray-600">Total Replies</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {moderator.assignedCategories.length}
            </div>
            <div className="text-gray-600">Categories</div>
          </div>
        </div>

        {/* Category Filter with Refresh Button */}
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
            <button
              onClick={handleRefresh}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Refresh
            </button>
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

        {/* Moderator Guidelines */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold text-blue-800 mb-3">Moderator Guidelines</h4>
          <ul className="text-blue-700 text-sm space-y-2">
            <li>✅ Only delete content that violates community guidelines</li>
            <li>✅ Focus on your assigned categories only</li>
            <li>✅ Be fair and consistent in your moderation decisions</li>
            <li>✅ Contact administrators for complex issues</li>
            <li>✅ Maintain professional conduct at all times</li>
          </ul>
        </div>
      </div>
    </div>
  );
}