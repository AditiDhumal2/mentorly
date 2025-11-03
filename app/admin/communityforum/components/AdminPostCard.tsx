import { CommunityPost } from '@/types/community';

interface AdminPostCardProps {
  post: CommunityPost;
  onDeletePost: (postId: string) => void;
  onDeleteReply: (postId: string, replyId: string) => void;
  isDeleting?: boolean;
}

export default function AdminPostCard({ 
  post, 
  onDeletePost, 
  onDeleteReply, 
  isDeleting = false 
}: AdminPostCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border-l-4 border-red-500">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
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
      
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>
      
      <div className="border-t pt-4">
        <h4 className="font-semibold mb-3 text-gray-800">
          Replies ({post.replies.length})
        </h4>
        
        <div className="space-y-3">
          {post.replies.map((reply) => (
            <div key={reply._id} className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium text-gray-800">{reply.userName}</span>
                  <span className="text-sm text-gray-500 ml-3">
                    {formatDate(reply.createdAt)}
                  </span>
                </div>
                <button
                  onClick={() => onDeleteReply(post._id, reply._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 border border-red-300 rounded hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Reply
                </button>
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