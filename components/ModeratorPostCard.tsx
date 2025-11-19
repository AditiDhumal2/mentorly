'use client';

import { CommunityPost } from '@/types/community';
import { useState } from 'react';
import { deletePostAction, deleteReplyAction } from '@/actions/communityforum-admin-actions';
import Snackbar from './Snackbar';

interface ModeratorPostCardProps {
  post: CommunityPost;
  currentUser: any;
  onPostDeleted: (postId: string) => void;
  onReplyDelete: (postId: string, replyId: string) => void;
}

export default function ModeratorPostCard({
  post,
  currentUser,
  onPostDeleted,
  onReplyDelete
}: ModeratorPostCardProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ type: 'post' | 'reply', id: string } | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleBadge = (role: string) => {
    const roleStyles = {
      student: 'bg-blue-100 text-blue-800 border border-blue-200',
      mentor: 'bg-green-100 text-green-800 border border-green-200',
      moderator: 'bg-purple-100 text-purple-800 border border-purple-200',
      admin: 'bg-red-100 text-red-800 border border-red-200'
    };

    const roleLabels = {
      student: '👨‍🎓 Student',
      mentor: '👨‍🏫 Mentor',
      moderator: '🛡️ Moderator',
      admin: '👑 Admin'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleStyles[role as keyof typeof roleStyles]}`}>
        {roleLabels[role as keyof typeof roleLabels]}
      </span>
    );
  };

  const getCategoryBadge = (category: string) => {
    const categoryStyles: { [key: string]: string } = {
      'higher-education': 'bg-blue-100 text-blue-800',
      'market-trends': 'bg-green-100 text-green-800',
      'domains': 'bg-purple-100 text-purple-800',
      'placements': 'bg-orange-100 text-orange-800',
      'general': 'bg-gray-100 text-gray-800',
      'academic': 'bg-blue-100 text-blue-800',
      'career': 'bg-green-100 text-green-800',
      'technical': 'bg-orange-100 text-orange-800',
      'announcement': 'bg-purple-100 text-purple-800'
    };

    const categoryLabels: { [key: string]: string } = {
      'higher-education': '🎓 Higher Ed',
      'market-trends': '📈 Market Trends',
      'domains': '🔧 Domains',
      'placements': '💼 Placements',
      'general': '💬 General',
      'academic': '📚 Academic',
      'career': '🚀 Career',
      'technical': '💻 Technical',
      'announcement': '📢 Announcement'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryStyles[category] || 'bg-gray-100 text-gray-800'}`}>
        {categoryLabels[category] || category}
      </span>
    );
  };

  const handleDeletePost = async () => {
    setDeletingItem({ type: 'post', id: post._id });
    try {
      const result = await deletePostAction(post._id, currentUser._id);
      if (result.success) {
        onPostDeleted(post._id);
        showSnackbar('Post deleted successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showSnackbar('Failed to delete post', 'error');
    } finally {
      setDeletingItem(null);
      setShowDeleteModal(false);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    setDeletingItem({ type: 'reply', id: replyId });
    try {
      const result = await deleteReplyAction(post._id, replyId, currentUser._id);
      if (result.success) {
        onReplyDelete(post._id, replyId);
        showSnackbar('Reply deleted successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to delete reply', 'error');
      }
    } catch (error) {
      console.error('Error deleting reply:', error);
      showSnackbar('Failed to delete reply', 'error');
    } finally {
      setDeletingItem(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{post.title}</h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600 mb-2">
              <div className="flex items-center space-x-2">
                <span>By {post.userName}</span>
                {getRoleBadge(post.userRole)}
              </div>
              <span>{formatDate(post.createdAt)}</span>
              {getCategoryBadge(post.category)}
            </div>
            {post.reportCount > 0 && (
              <div className="mb-2">
                <span className="text-red-500 text-sm font-medium">⚠️ {post.reportCount} reports</span>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={!!deletingItem}
            className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-red-400 disabled:cursor-not-allowed"
          >
            {deletingItem?.type === 'post' ? 'Deleting...' : 'Delete Post'}
          </button>
        </div>
        
        <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
        
        {/* Replies */}
        <div className="border-t pt-4">
          <h4 className="font-semibold mb-3 text-gray-800">
            Replies ({post.replies.length})
          </h4>
          
          <div className="space-y-3">
            {post.replies.map((reply) => (
              <div key={reply._id} className="bg-gray-50 p-4 rounded-lg border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{reply.userName}</span>
                    {getRoleBadge(reply.userRole)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.createdAt)}
                    </span>
                    <button
                      onClick={() => handleDeleteReply(reply._id)}
                      disabled={deletingItem?.id === reply._id}
                      className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {deletingItem?.id === reply._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 text-sm mt-2">{reply.message}</p>
              </div>
            ))}
            
            {post.replies.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 text-sm">No replies yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Moderator Guidelines</h4>
              <p className="text-yellow-700 text-sm">
                Please ensure this post violates community guidelines before deleting.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePost}
                disabled={!!deletingItem}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {deletingItem ? 'Deleting...' : 'Delete Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
      />
    </>
  );
}