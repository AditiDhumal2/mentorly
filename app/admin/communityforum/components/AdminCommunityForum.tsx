'use client';

import { CommunityPost } from '@/types/community';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AdminPostCard from './AdminPostCard';
import AdminStats from './AdminStats';
import AdminHeader from './AdminHeader';
import EmptyState from './EmptyState';
import LoadingState from './LoadingState';
import Snackbar from '@/components/Snackbar';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import NewPostModal from './NewPostModal';
import PostDetailsModal from './PostDetailsModal';
import AnalyticsView from './AnalyticsView';
import { addAdminCommunityPostAction, replyToPostAction, getAdminMentorChats, deletePostAction, deleteReplyAction } from '@/actions/communityforum-admin-actions';

interface AdminCommunityForumProps {
  posts: CommunityPost[];
  loading: boolean;
  currentCategory?: string;
  onDeletePost?: (postId: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteReply?: (postId: string, replyId: string) => Promise<{ success: boolean; error?: string }>;
}

// Mock admin data
const MOCK_ADMIN = {
  id: '67a2b1c3d4e5f67890123457',
  name: 'Admin User',
  role: 'admin' as const
};

export default function AdminCommunityForum({
  posts: initialPosts,
  loading,
  currentCategory,
  onDeletePost = deletePostAction,
  onDeleteReply = deleteReplyAction
}: AdminCommunityForumProps) {
  const router = useRouter();
  const [currentUser] = useState<any>(MOCK_ADMIN);
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
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: 'post' | 'reply';
    postId?: string;
    replyId?: string;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'post',
    title: '',
    message: ''
  });

  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all-posts' | 'admin-mentors' | 'reported' | 'analytics'>('all-posts');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const showDeleteConfirmation = (type: 'post' | 'reply', postId: string, replyId?: string, title?: string) => {
    const isPost = type === 'post';
    const itemTitle = title || (isPost ? 'this post' : 'this reply');
    
    setDeleteModal({
      isOpen: true,
      type,
      postId,
      replyId,
      title: `Delete ${isPost ? 'Post' : 'Reply'}`,
      message: `Are you sure you want to delete ${itemTitle}? This action cannot be undone.`
    });
  };

  const handleConfirmDelete = async () => {
    const { type, postId, replyId } = deleteModal;
    
    if (!postId) return;

    const deletingId = type === 'post' ? postId : (replyId || '');
    setDeleting(deletingId);
    
    try {
      let result;
      if (type === 'post') {
        result = await onDeletePost(postId);
        if (result.success) {
          setPosts(prev => prev.filter(post => post._id !== postId));
          showSnackbar('Post deleted successfully', 'success');
        } else {
          showSnackbar(result.error || 'Failed to delete post', 'error');
        }
      } else {
        if (!replyId) return;
        result = await onDeleteReply(postId, replyId);
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
      }
    } catch (error) {
      showSnackbar(`An error occurred while deleting the ${type}`, 'error');
    } finally {
      setDeleting(null);
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleCloseModal = () => {
    setDeleteModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleDeletePost = (postId: string, postTitle?: string) => {
    showDeleteConfirmation('post', postId, undefined, postTitle);
  };

  const handleDeleteReply = (postId: string, replyId: string) => {
    showDeleteConfirmation('reply', postId, replyId);
  };

  const handleCreatePost = async (data: { 
    title: string; 
    content: string; 
    category: string;
    visibility: 'admin-mentors';
  }) => {
    if (!currentUser) {
      showSnackbar('Please log in to create a post', 'error');
      return;
    }

    try {
      const result = await addAdminCommunityPostAction({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'admin',
        category: data.category as CommunityPost['category']
      });

      if (result.success) {
        showSnackbar('Admin-Mentor chat created successfully!', 'success');
        // Reload posts
        const updatedPosts = await getAdminMentorChats();
        setPosts(prev => [...prev, ...updatedPosts]);
        setIsNewPostModalOpen(false);
      } else {
        showSnackbar(result.error || 'Failed to create post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showSnackbar('Failed to create post', 'error');
    }
  };

  const handleAddReply = async (message: string) => {
    if (!selectedPost?._id || !currentUser) {
      showSnackbar('Please log in to reply to posts', 'error');
      return;
    }

    try {
      const result = await replyToPostAction(selectedPost._id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'admin',
        message
      });

      if (result.success) {
        showSnackbar('Reply added successfully!', 'success');
        // Refresh the selected post
        const updatedPosts = await getAdminMentorChats();
        const updatedPost = updatedPosts.find(p => p._id === selectedPost._id);
        if (updatedPost) {
          setSelectedPost(updatedPost);
          setPosts(prev => prev.map(p => p._id === selectedPost._id ? updatedPost : p));
        }
      } else {
        showSnackbar(result.error || 'Failed to add reply', 'error');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showSnackbar('Failed to add reply', 'error');
    }
  };

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setTimeout(() => setSelectedPost(null), 300);
  };

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    switch (activeTab) {
      case 'admin-mentors':
        return posts.filter(post => post.visibility === 'admin-mentors');
      case 'reported':
        return posts.filter(post => post.reportCount > 0);
      case 'analytics':
        return posts;
      case 'all-posts':
      default:
        return posts;
    }
  }, [activeTab, posts]);

  // Calculate counts
  const allPostsCount = posts.length;
  const adminMentorsCount = posts.filter(post => post.visibility === 'admin-mentors').length;
  const reportedPostsCount = posts.filter(post => post.reportCount > 0).length;

  // Calculate stats for header
  const stats = {
    totalReports: posts.reduce((total, post) => total + post.reportCount, 0),
    recentActivity: posts.filter(post => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(post.createdAt) > oneWeekAgo;
    }).length,
    engagementRate: posts.length > 0 
      ? parseFloat((posts.reduce((total, post) => total + post.replies.length, 0) / posts.length).toFixed(1))
      : 0
  };

  const getCategoryName = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      'higher-education': 'Higher Education',
      'market-trends': 'Market Trends',
      'domains': 'Domains & Specializations',
      'placements': 'Placements & Careers',
      'announcements': 'Announcements',
      'general': 'General Discussion',
      'mentor-chats': 'Mentor Discussions',
      'admin-mentors': 'Admin-Mentor Chats'
    };
    return categoryMap[categoryId] || categoryId;
  };

  // If we have a current category, show category header
  if (currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Category Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/admin/communityforum')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>All Categories</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {getCategoryName(currentCategory)}
                  </h1>
                  <p className="text-gray-600">
                    Posts in {getCategoryName(currentCategory)} category
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {posts.length} posts
              </div>
            </div>
          </div>
        </div>

        {/* Your existing admin content */}
        <div className="py-8">
          <div className="max-w-7xl mx-auto px-4">
            <AdminHeader 
              filteredPostsCount={filteredPosts.length}
              totalPostsCount={posts.length}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              allPostsCount={allPostsCount}
              adminMentorsCount={adminMentorsCount}
              reportedPostsCount={reportedPostsCount}
              onNewPost={() => setIsNewPostModalOpen(true)}
              currentUser={currentUser}
              stats={stats}
            />

            {activeTab !== 'analytics' && <AdminStats posts={posts} />}

            <div className="space-y-6">
              {activeTab === 'analytics' ? (
                <AnalyticsView posts={posts} />
              ) : filteredPosts.length === 0 ? (
                <EmptyState
                  title={`No ${activeTab.replace('-', ' ')} content found`}
                  message={`There are no posts in this category to display.`}
                />
              ) : (
                filteredPosts.map((post) => (
                  <AdminPostCard
                    key={post._id}
                    post={post}
                    onDeletePost={() => handleDeletePost(post._id, post.title)}
                    onDeleteReply={handleDeleteReply}
                    onViewPost={handleViewPost}
                    isDeleting={deleting === post._id}
                    currentUser={currentUser}
                  />
                ))
              )}
            </div>

            {/* Footer Info */}
            {activeTab !== 'analytics' && filteredPosts.length > 0 && (
              <div className="mt-8 text-center">
                <p className="text-gray-500 text-sm">
                  Showing {filteredPosts.length} posts in {getCategoryName(currentCategory)}
                </p>
              </div>
            )}

            {/* Modals */}
            <NewPostModal
              isOpen={isNewPostModalOpen}
              onClose={() => setIsNewPostModalOpen(false)}
              onSubmit={handleCreatePost}
              currentUser={currentUser}
            />

            <PostDetailsModal
              post={selectedPost}
              isOpen={isPostModalOpen}
              onClose={handleClosePostModal}
              onAddReply={handleAddReply}
              currentUser={currentUser}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
              isOpen={deleteModal.isOpen}
              onClose={handleCloseModal}
              onConfirm={handleConfirmDelete}
              title={deleteModal.title}
              message={deleteModal.message}
              isLoading={!!deleting}
            />

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
      </div>
    );
  }

  return null;
}