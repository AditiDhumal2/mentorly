'use client';

import { CommunityPost } from '@/types/community';
import { useState } from 'react';

interface StudentPostCardProps {
  post: CommunityPost;
  onViewPost: (post: CommunityPost) => void;
  userId?: string;
  onUpvote: (postId: string) => void;
  onReportPost: (postId: string, replyId: string | undefined, reason: string) => void;
  currentUser: any;
}

export default function StudentPostCard({ 
  post, 
  onViewPost, 
  userId, 
  onUpvote, 
  onReportPost,
  currentUser 
}: StudentPostCardProps) {
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

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
      general: 'bg-gray-100 text-gray-800',
      academic: 'bg-blue-100 text-blue-800',
      career: 'bg-green-100 text-green-800',
      technical: 'bg-orange-100 text-orange-800',
      announcement: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${categoryStyles[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
      </span>
    );
  };

  const handleReport = () => {
    if (reportReason.trim()) {
      onReportPost(post._id, undefined, reportReason);
      setShowReportModal(false);
      setReportReason('');
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
          <div className="flex items-center space-x-2">
            {getVisibilityBadge(post.visibility)}
            {getRoleBadge(post.userRole)}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mb-3">
          {getCategoryBadge(post.category)}
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
              View Discussion
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
    </>
  );
}