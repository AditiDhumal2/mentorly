'use client';

import { CommunityPost } from '@/types/community';
import { useState, useEffect } from 'react';
import { checkMentorPostPermissions, deleteMentorPostAction, updateMentorPostAction } from '@/actions/communityforum-mentor-actions';
import Snackbar from '@/components/Snackbar';

interface MentorPostCardProps {
  post: CommunityPost;
  onViewPost: (post: CommunityPost) => void;
  userId?: string;
  onUpvote: (postId: string) => void;
  onReportPost: (postId: string, replyId: string | undefined, reason: string) => void;
  currentUser: any;
  onPostUpdated?: (post: CommunityPost) => void;
  onPostDeleted?: (postId: string) => void;
}

interface PermissionState {
  canEdit: boolean;
  canDelete: boolean;
  reason: string;
}

export default function MentorPostCard({ 
  post, 
  onViewPost, 
  userId, 
  onUpvote, 
  onReportPost,
  currentUser,
  onPostUpdated,
  onPostDeleted
}: MentorPostCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [editData, setEditData] = useState({ title: post.title, content: post.content, category: post.category });
  const [permissions, setPermissions] = useState<PermissionState>({ canEdit: false, canDelete: false, reason: '' });
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    if (currentUser && post) {
      checkPermissions();
    }
  }, [currentUser, post]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const checkPermissions = async () => {
    if (!currentUser) return;
    
    const result = await checkMentorPostPermissions(post._id, currentUser.id || currentUser._id, currentUser.role);
    setPermissions({
      canEdit: result.canEdit,
      canDelete: result.canDelete,
      reason: result.reason || ''
    });
  };

  const isUpvoted = userId && post.upvotes && 
    post.upvotes.some(upvoteId => upvoteId === userId);

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

  const getRoleBadge = (role: 'student' | 'mentor' | 'moderator' | 'admin') => {
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
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleStyles[role]}`}>
        {roleLabels[role]}
      </span>
    );
  };

  const getVisibilityBadge = (visibility: string) => {
    const visibilityStyles: { [key: string]: string } = {
      public: 'bg-gray-100 text-gray-800',
      students: 'bg-blue-100 text-blue-800',
      mentors: 'bg-green-100 text-green-800',
      'admin-mentors': 'bg-purple-100 text-purple-800'
    };

    const visibilityLabels: { [key: string]: string } = {
      public: '🌍 Public',
      students: '👥 Students Only',
      mentors: '👨‍🏫 Mentors Only',
      'admin-mentors': '🔒 Admin-Mentors'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${visibilityStyles[visibility] || 'bg-gray-100 text-gray-800'}`}>
        {visibilityLabels[visibility] || visibility}
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

  const handleEdit = async () => {
    if (!permissions.canEdit) return;
    
    setLoading(true);
    try {
      const result = await updateMentorPostAction(
        post._id,
        editData,
        currentUser.id || currentUser._id,
        currentUser.role
      );

      if (result.success) {
        setShowEditModal(false);
        if (onPostUpdated) {
          onPostUpdated({ ...post, ...editData, edited: true, editedAt: new Date().toISOString() });
        }
        showSnackbar('Post updated successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to update post', 'error');
      }
    } catch (error) {
      console.error('Error updating post:', error);
      showSnackbar('Failed to update post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!permissions.canDelete) return;
    
    setLoading(true);
    try {
      const result = await deleteMentorPostAction(
        post._id,
        currentUser.id || currentUser._id,
        currentUser.role
      );

      if (result.success) {
        setShowDeleteModal(false);
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
        showSnackbar('Post deleted successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to delete post', 'error');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      showSnackbar('Failed to delete post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      onReportPost(post._id, undefined, reportReason);
      setShowReportModal(false);
      setReportReason('');
      showSnackbar('Post reported successfully. Moderators will review it.', 'success');
    }
  };

  const getActionButtonText = () => {
    if (post.visibility === 'students' && post.userRole === 'mentor') {
      return '💬 View Discussion';
    }
    if (post.visibility === 'public' && post.userRole === 'student') {
      return '💬 Help Student';
    }
    return 'View Discussion';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
          <div className="flex items-center space-x-2">
            {getVisibilityBadge(post.visibility)}
            {getRoleBadge(post.userRole)}
            {(permissions.canEdit || permissions.canDelete) && (
              <div className="flex space-x-1 ml-2">
                {permissions.canEdit && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                    title="Edit post"
                  >
                    ✏️
                  </button>
                )}
                {permissions.canDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                    title="Delete post"
                  >
                    🗑️
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
          {getCategoryBadge(post.category)}
          {post.edited && (
            <span className="text-xs text-gray-500 italic">
              (edited {post.editedAt ? formatDate(post.editedAt) : 'recently'})
            </span>
          )}
          {!permissions.canEdit && permissions.reason && (
            <span className="text-xs text-gray-500" title={permissions.reason}>
              🔒 {post.replies.length > 0 ? 'Has replies' : 'Locked'}
            </span>
          )}
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
        
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>By {post.userName}</span>
            <span>{formatDate(post.createdAt)}</span>
            <span>{(post.replies || []).length} replies</span>
            {post.reportCount > 0 && (
              <span className="text-red-500">⚠️ {post.reportCount} reports</span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpvote(post._id)}
              className={`flex items-center space-x-1 px-3 py-1 rounded ${
                isUpvoted 
                  ? 'bg-orange-100 text-orange-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>▲</span>
              <span>{(post.upvotes || []).length}</span>
            </button>
            
            {currentUser && (
              <button
                onClick={() => setShowReportModal(true)}
                className="text-red-500 hover:text-red-700 px-3 py-1 rounded hover:bg-red-50 transition-colors"
                title="Report post"
              >
                ⚠️ Report
              </button>
            )}
            
            <button
              onClick={() => onViewPost(post)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              {getActionButtonText()}
            </button>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Report Post</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for reporting this post:</p>
            
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="Enter reason for reporting..."
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Edit Post</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editData.title}
                    onChange={(e) => setEditData({...editData, title: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter post title..."
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Content
                  </label>
                  <textarea
                    value={editData.content}
                    onChange={(e) => setEditData({...editData, content: e.target.value})}
                    rows={6}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your post content..."
                    required
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Editing Guidelines</h4>
                  <p className="text-blue-700 text-sm">
                    You can only edit posts that have no replies. Once someone replies to your post, 
                    editing will be disabled to maintain conversation context.
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEdit}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Updating...' : 'Update Post'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Delete Post</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-yellow-800 mb-2">Important</h4>
              <p className="text-yellow-700 text-sm">
                You can only delete posts that have no replies. Once someone replies to your post, 
                deletion will be disabled to maintain conversation integrity.
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
                onClick={handleDelete}
                disabled={loading}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Deleting...' : 'Delete Post'}
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