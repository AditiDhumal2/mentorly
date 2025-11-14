'use client';

import { CommunityPost } from '@/types/community';
import { useState } from 'react';

interface PostDetailsModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onAddReply: (message: string) => void;
  onReportPost: (postId: string, replyId: string | undefined, reason: string) => void;
  currentUser: any;
}

export default function PostDetailsModal({ 
  post, 
  isOpen, 
  onClose, 
  onAddReply,
  onReportPost,
  currentUser
}: PostDetailsModalProps) {
  const [replyMessage, setReplyMessage] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingReplyId, setReportingReplyId] = useState<string | undefined>(undefined);

  if (!isOpen || !post) return null;

  const sortedReplies = [...(post.replies || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

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
    const visibilityStyles: Record<string, string> = {
      public: 'bg-gray-100 text-gray-800',
      students: 'bg-blue-100 text-blue-800',
      mentors: 'bg-green-100 text-green-800',
      'admin-mentors': 'bg-purple-100 text-purple-800'
    };

    const visibilityLabels: Record<string, string> = {
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
    const categoryStyles: Record<string, string> = {
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

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyMessage.trim()) {
      onAddReply(replyMessage);
      setReplyMessage('');
    }
  };

  const handleReport = (replyId?: string) => {
    setReportingReplyId(replyId);
    setShowReportModal(true);
  };

  const handleConfirmReport = () => {
    if (reportReason.trim()) {
      onReportPost(post._id, reportingReplyId, reportReason);
      setShowReportModal(false);
      setReportReason('');
      setReportingReplyId(undefined);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-2">
                    <span>By {post.userName}</span>
                    {getRoleBadge(post.userRole)}
                  </div>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getVisibilityBadge(post.visibility)}
                  {getCategoryBadge(post.category)}
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
              >
                ×
              </button>
            </div>
            
            <div className="prose max-w-none mb-8">
              <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            </div>
            
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-gray-800">
                  Replies ({(post.replies || []).length})
                </h3>
                {currentUser && (
                  <button
                    onClick={() => handleReport()}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    ⚠️ Report Post
                  </button>
                )}
              </div>
              
              <div className="space-y-4 mb-6">
                {sortedReplies.map((reply) => (
                  <div key={reply._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800">{reply.userName}</span>
                        {getRoleBadge(reply.userRole)}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {formatDate(reply.createdAt)}
                        </span>
                        {currentUser && (
                          <button
                            onClick={() => handleReport(reply._id)}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                            title="Report reply"
                          >
                            ⚠️
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700">{reply.message}</p>
                  </div>
                ))}
                
                {sortedReplies.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    No replies yet. Be the first to reply!
                  </p>
                )}
              </div>
              
              {/* Reply Form */}
              {currentUser ? (
                <form onSubmit={handleSubmitReply} className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-800 mb-3">Post Your Reply</h4>
                  <div className="mb-3">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      rows={4}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Write your reply..."
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Character count: {replyMessage.length}
                    </span>
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                    >
                      Post Reply
                    </button>
                  </div>
                </form>
              ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-gray-600">
                    Please log in to reply to this post
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              Report {reportingReplyId ? 'Reply' : 'Post'}
            </h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for reporting this {reportingReplyId ? 'reply' : 'post'}:
            </p>
            
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder="Enter reason for reporting..."
            />
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowReportModal(false);
                  setReportReason('');
                  setReportingReplyId(undefined);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReport}
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