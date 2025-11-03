import { CommunityPost } from '@/types/community';

interface PostCardProps {
  post: CommunityPost;
  onViewPost: (post: CommunityPost) => void;
  userId?: string;
  onUpvote: (postId: string) => void;
}

export default function PostCard({ post, onViewPost, userId, onUpvote }: PostCardProps) {
  // Safe upvote check
  const isUpvoted = userId && post.upvotes && 
    post.upvotes.some(upvoteId => upvoteId === userId);

  // Format date consistently
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          post.category === 'query' ? 'bg-blue-100 text-blue-800' :
          post.category === 'discussion' ? 'bg-green-100 text-green-800' :
          'bg-purple-100 text-purple-800'
        }`}>
          {post.category}
        </span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{post.content}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>By {post.userName}</span>
          <span>{formatDate(post.createdAt)}</span>
          <span>{(post.replies || []).length} replies</span>
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
          
          <button
            onClick={() => onViewPost(post)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            View Discussion
          </button>
        </div>
      </div>
    </div>
  );
}