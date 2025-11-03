import { CommunityPost } from '@/types/community';

interface AdminStatsProps {
  posts: CommunityPost[];
}

export default function AdminStats({ posts }: AdminStatsProps) {
  const totalReplies = posts.reduce((total, post) => total + post.replies.length, 0);
  const totalUpvotes = posts.reduce((total, post) => total + post.upvotes.length, 0);

  // Count posts by category
  const queryPosts = posts.filter(post => post.category === 'query').length;
  const discussionPosts = posts.filter(post => post.category === 'discussion').length;
  const announcementPosts = posts.filter(post => post.category === 'announcement').length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800">Total Posts</h3>
        <p className="text-2xl font-bold text-blue-600">{posts.length}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800">Total Replies</h3>
        <p className="text-2xl font-bold text-green-600">{totalReplies}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
        <h3 className="text-lg font-semibold text-gray-800">Total Upvotes</h3>
        <p className="text-2xl font-bold text-orange-600">{totalUpvotes}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-800">Questions</h3>
        <p className="text-2xl font-bold text-purple-600">{queryPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
        <h3 className="text-lg font-semibold text-gray-800">Discussions</h3>
        <p className="text-2xl font-bold text-teal-600">{discussionPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-indigo-500">
        <h3 className="text-lg font-semibold text-gray-800">Announcements</h3>
        <p className="text-2xl font-bold text-indigo-600">{announcementPosts}</p>
      </div>
    </div>
  );
}