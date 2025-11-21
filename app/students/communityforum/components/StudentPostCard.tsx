'use client';

import { CommunityPost } from '@/types/community';
import { useState, useEffect } from 'react';
import { checkStudentPostPermissions, deleteStudentPostAction, updateStudentPostAction } from '@/actions/communityforum-students-actions';
import Snackbar from '@/components/Snackbar';

interface StudentPostCardProps {
  post: CommunityPost;
  onViewPost: (post: CommunityPost) => void;
  userId?: string;
  onUpvote: (postId: string) => void;
  onReportPost: (postId: string, replyId: string | undefined, reason: string) => void;
  currentUser: any;
  isAnnouncementTab?: boolean;
  onPostUpdated?: (post: CommunityPost) => void;
  onPostDeleted?: (postId: string) => void;
}

interface PermissionState {
  canEdit: boolean;
  canDelete: boolean;
  reason: string;
}

export default function StudentPostCard({ 
  post, 
  onViewPost, 
  userId, 
  onUpvote, 
  onReportPost,
  currentUser,
  isAnnouncementTab = false,
  onPostUpdated,
  onPostDeleted
}: StudentPostCardProps) {
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

  // SECURITY DEBUG: Log user and post info
  useEffect(() => {
    console.log('🔍 SECURITY DEBUG - StudentPostCard:', {
      currentUser: currentUser,
      post: post,
      permissions: permissions,
      windowLocation: typeof window !== 'undefined' ? window.location.pathname : '',
    });
  }, [currentUser, post, permissions]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const checkPermissions = async () => {
    if (!currentUser) return;
    
    try {
      // SECURITY FIX: Use consistent ID field
      const studentId = currentUser.id || currentUser._id;
      
      console.log('🔐 Student Permission Check - STRICT OWNERSHIP:', {
        postId: post._id,
        currentUserId: studentId,
        postUserId: post.userId,
        result: await checkStudentPostPermissions(post._id, studentId, currentUser.role)
      });

      const result = await checkStudentPostPermissions(
        post._id, 
        studentId, 
        currentUser.role
      );

      setPermissions({
        canEdit: result.canEdit,
        canDelete: result.canDelete,
        reason: result.reason || ''
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      setPermissions({
        canEdit: false,
        canDelete: false,
        reason: 'Error checking permissions'
      });
    }
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
    if (!permissions.canEdit) {
      showSnackbar(permissions.reason || 'You cannot edit this post', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const studentId = currentUser.id || currentUser._id;
      
      const result = await updateStudentPostAction(
        post._id,
        editData,
        studentId,
        currentUser.role
      );

      if (result.success) {
        setShowEditModal(false);
        if (onPostUpdated) {
          onPostUpdated({ ...post, ...editData, edited: true, editedAt: new Date().toISOString() });
        }
        showSnackbar('Post updated successfully!', 'success');
        // Refresh permissions after update
        await checkPermissions();
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
    if (!permissions.canDelete) {
      showSnackbar(permissions.reason || 'You cannot delete this post', 'error');
      return;
    }
    
    setLoading(true);
    try {
      const studentId = currentUser.id || currentUser._id;
      
      const result = await deleteStudentPostAction(
        post._id,
        studentId,
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

  const getViewButtonText = () => {
    if (post.category === 'announcement') {
      return '📢 View Announcement';
    }
    return 'View Discussion';
  };

  // 🆕 CRITICAL FIX: Only use server permissions, not client-side ownership check
  const shouldShowManageButtons = permissions.canEdit && permissions.canDelete;

  console.log('🎯 Student Post Card Render - STRICT PERMISSIONS:', {
    postId: post._id,
    permissions: permissions,
    shouldShowManageButtons: shouldShowManageButtons
  });

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
            {post.edited && (
              <span className="text-xs text-gray-500 italic">
                (edited {post.editedAt ? formatDate(post.editedAt) : 'recently'})
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {getRoleBadge(post.userRole)}
            {shouldShowManageButtons && (
              <div className="flex space-x-1 ml-2">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  title="Edit post"
                >
                  ✏️
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="text-red-600 hover:text-red-800 text-sm px-2 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors"
                  title="Delete post"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
          {getCategoryBadge(post.category)}
          {post.category === 'announcement' && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
              📢 Read Only
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
              {getViewButtonText()}
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