'use client';

import { CommunityPost } from '@/types/community';
import { useState } from 'react';

interface PostDetailsModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onAddReply: (message: string) => void;
  currentUser: any;
}

export default function PostDetailsModal({ 
  post, 
  isOpen, 
  onClose, 
  onAddReply,
  currentUser
}: PostDetailsModalProps) {
  const [replyMessage, setReplyMessage] = useState('');

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

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyMessage.trim()) {
      onAddReply(replyMessage);
      setReplyMessage('');
    }
  };

  return (
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
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Replies ({(post.replies || []).length})
            </h3>
            
            <div className="space-y-4 mb-6">
              {sortedReplies.map((reply) => (
                <div key={reply._id} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-800">{reply.userName}</span>
                      {getRoleBadge(reply.userRole)}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.createdAt)}
                    </span>
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
            
            {/* Reply Form - Only show for admin-mentor chats */}
            {post.visibility === 'admin-mentors' && currentUser ? (
              <form onSubmit={handleSubmitReply} className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-lg font-semibold text-blue-800 mb-3">
                  💬 Reply as Admin
                </h4>
                <div className="mb-3">
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Write your reply to mentors..."
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
              !currentUser && (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                  <p className="text-gray-600">
                    Please log in to reply to this post
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}