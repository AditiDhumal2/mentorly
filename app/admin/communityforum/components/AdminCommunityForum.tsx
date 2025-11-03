'use client';

import { CommunityPost } from '@/types/community';
import AdminPostCard from './AdminPostCard';
import AdminStats from './AdminStats';
import AdminFilters from './AdminFilters';
import AdminHeader from './AdminHeader';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import Snackbar from '@/components/Snackbar';
import { useState } from 'react';

interface AdminCommunityForumProps {
  posts: CommunityPost[];
  loading: boolean;
  onDeletePost: (postId: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteReply: (postId: string, replyId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function AdminCommunityForum({
  posts: initialPosts,
  loading,
  onDeletePost,
  onDeleteReply
}: AdminCommunityForumProps) {
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const [deleting, setDeleting] = useState<string | null>(null);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleDeletePost = async (postId: string) => {
    setDeleting(postId);
    try {
      const result = await onDeletePost(postId);
      if (result.success) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        showSnackbar('Post deleted successfully', 'success');
      } else {
        showSnackbar(result.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred while deleting the post', 'error');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteReply = async (postId: string, replyId: string) => {
    setDeleting(replyId);
    try {
      const result = await onDeleteReply(postId, replyId);
      if (result.success) {
        setPosts(prev => prev.map(post => 
          post._id === postId 
            ? { ...post, replies: post.replies.filter(reply => reply._id !== replyId) }
            : post
        ));
        showSnackbar('Reply deleted successfully', 'success');
      } else {
        showSnackbar(result.error || 'Failed to delete reply', 'error');
      }
    } catch (error) {
      showSnackbar('An error occurred while deleting the reply', 'error');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <AdminHeader 
          filteredPostsCount={posts.length}
          totalPostsCount={posts.length}
        />

        {/* Statistics */}
        <AdminStats posts={posts} />

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <EmptyState
              title="No posts found"
              message="There are no community posts to moderate yet."
            />
          ) : (
            posts.map((post) => (
              <AdminPostCard
                key={post._id}
                post={post}
                onDeletePost={handleDeletePost}
                onDeleteReply={handleDeleteReply}
                isDeleting={deleting === post._id}
              />
            ))
          )}
        </div>

        {/* Footer Info */}
        {posts.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Showing {posts.length} posts
            </p>
          </div>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          autoHideDuration={6000}
        />
      </div>
    </div>
  );
}