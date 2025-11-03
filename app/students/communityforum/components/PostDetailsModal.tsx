'use client';

import { CommunityPost } from '@/types/community';
import ReplyCard from './ReplyCard';
import AddReplyForm from './AddReplyForm';

interface PostDetailsModalProps {
  post: CommunityPost | null;
  isOpen: boolean;
  onClose: () => void;
  onAddReply: (message: string) => void;
  currentUserId?: string; // Changed to string
}

export default function PostDetailsModal({ 
  post, 
  isOpen, 
  onClose, 
  onAddReply,
  currentUserId 
}: PostDetailsModalProps) {
  if (!isOpen || !post) return null;

  const sortedReplies = [...(post.replies || [])].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{post.title}</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>By {post.userName}</span>
                <span>{formatDate(post.createdAt)}</span>
                <span className={`px-2 py-1 rounded-full ${
                  post.category === 'query' ? 'bg-blue-100 text-blue-800' :
                  post.category === 'discussion' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {post.category}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="prose max-w-none mb-8">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>
          
          <div className="border-t pt-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Replies ({(post.replies || []).length})
            </h3>
            
            <div className="space-y-4 mb-6">
              {sortedReplies.map((reply) => (
                <ReplyCard key={reply._id} reply={reply} />
              ))}
              
              {sortedReplies.length === 0 && (
                <p className="text-gray-500 text-center py-8">
                  No replies yet. Be the first to reply!
                </p>
              )}
            </div>
            
            {currentUserId && (
              <AddReplyForm onAddReply={onAddReply} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}