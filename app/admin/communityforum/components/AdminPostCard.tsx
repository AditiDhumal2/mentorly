'use client';

import { CommunityPost } from '@/types/community';

interface AdminPostCardProps {
  post: CommunityPost;
  onDeletePost: (postId: string) => void;
  onDeleteReply: (postId: string, replyId: string) => void;
  onViewPost: (post: CommunityPost) => void;
  isDeleting?: boolean;
  currentUser: any;
}

export default function AdminPostCard({ 
  post, 
  onDeletePost, 
  onDeleteReply, 
  onViewPost,
  isDeleting = false,
  currentUser
}: AdminPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
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
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${categoryStyles[category] || 'bg-gray-100 text-gray-800'}`}>
        {category}
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-red-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
              onClick={() => onViewPost(post)}>
            {post.title}
          </h3>
          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
            <span>By {post.userName}</span>
            <span>{getRoleBadge(post.userRole)}</span>
            <span>{formatDate(post.createdAt)}</span>
            <div className="flex items-center space-x-2">
              {getCategoryBadge(post.category)}
              {getVisibilityBadge(post.visibility)}
            </div>
          </div>
          {post.reportCount > 0 && (
            <div className="mt-2">
              <span className="text-red-500 text-sm font-medium">⚠️ {post.reportCount} reports</span>
            </div>
          )}
          {post.isDeleted && (
            <div className="mt-2">
              <span className="text-gray-500 text-sm font-medium">🗑️ Deleted</span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewPost(post)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            View
          </button>
          <button
            onClick={() => onDeletePost(post._id)}
            disabled={isDeleting}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:bg-red-400 disabled:cursor-not-allowed min-w-24 flex items-center justify-center"
          >
            {isDeleting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Deleting...
              </>
            ) : (
              'Delete Post'
            )}
          </button>
        </div>
      </div>
      
      <p className="text-gray-700 mb-4 whitespace-pre-wrap line-clamp-3">{post.content}</p>
      
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
                  {reply.isDeleted && (
                    <span className="text-gray-500 text-sm">(deleted)</span>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">
                    {formatDate(reply.createdAt)}
                  </span>
                  <button
                    onClick={() => onDeleteReply(post._id, reply._id)}
                    className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete Reply
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
  );
}