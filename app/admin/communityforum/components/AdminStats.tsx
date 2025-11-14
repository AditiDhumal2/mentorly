import { CommunityPost } from '@/types/community';

interface AdminStatsProps {
  posts: CommunityPost[];
}

export default function AdminStats({ posts }: AdminStatsProps) {
  const totalReplies = posts.reduce((total, post) => total + post.replies.length, 0);
  const totalUpvotes = posts.reduce((total, post) => total + post.upvotes.length, 0);
  const totalReports = posts.reduce((total, post) => total + post.reportCount, 0);
  const deletedPosts = posts.filter(post => post.isDeleted).length;

  // Count posts by category with new categories
  const generalPosts = posts.filter(post => post.category === 'general').length;
  const academicPosts = posts.filter(post => post.category === 'academic').length;
  const careerPosts = posts.filter(post => post.category === 'career').length;
  const technicalPosts = posts.filter(post => post.category === 'technical').length;
  const announcementPosts = posts.filter(post => post.category === 'announcement').length;

  // Count by visibility
  const publicPosts = posts.filter(post => post.visibility === 'public').length;
  const studentPosts = posts.filter(post => post.visibility === 'students').length;
  const mentorPosts = posts.filter(post => post.visibility === 'mentors').length;
  const adminMentorPosts = posts.filter(post => post.visibility === 'admin-mentors').length;

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
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-red-500">
        <h3 className="text-lg font-semibold text-gray-800">Reports</h3>
        <p className="text-2xl font-bold text-red-600">{totalReports}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-800">Deleted</h3>
        <p className="text-2xl font-bold text-purple-600">{deletedPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-teal-500">
        <h3 className="text-lg font-semibold text-gray-800">Active</h3>
        <p className="text-2xl font-bold text-teal-600">{posts.length - deletedPosts}</p>
      </div>

      {/* Category Stats */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
        <h3 className="text-lg font-semibold text-gray-800">General</h3>
        <p className="text-2xl font-bold text-gray-600">{generalPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800">Academic</h3>
        <p className="text-2xl font-bold text-blue-600">{academicPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800">Career</h3>
        <p className="text-2xl font-bold text-green-600">{careerPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-orange-500">
        <h3 className="text-lg font-semibold text-gray-800">Technical</h3>
        <p className="text-2xl font-bold text-orange-600">{technicalPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-800">Announcements</h3>
        <p className="text-2xl font-bold text-purple-600">{announcementPosts}</p>
      </div>

      {/* Visibility Stats */}
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-gray-500">
        <h3 className="text-lg font-semibold text-gray-800">Public</h3>
        <p className="text-2xl font-bold text-gray-600">{publicPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
        <h3 className="text-lg font-semibold text-gray-800">Students Only</h3>
        <p className="text-2xl font-bold text-blue-600">{studentPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
        <h3 className="text-lg font-semibold text-gray-800">Mentors Only</h3>
        <p className="text-2xl font-bold text-green-600">{mentorPosts}</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
        <h3 className="text-lg font-semibold text-gray-800">Admin-Mentor</h3>
        <p className="text-2xl font-bold text-purple-600">{adminMentorPosts}</p>
      </div>
    </div>
  );
}