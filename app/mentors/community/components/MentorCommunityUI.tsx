'use client';

import { CommunityPost } from '@/types/community';
import MentorPostCard from './PostCard';
import NewPostModal from './NewPostModal';
import PostDetailsModal from './PostDetailsModal';

interface MentorCommunityUIProps {
  posts: CommunityPost[];
  loading: boolean;
  currentUser: any;
  onCreatePost: (data: { title: string; content: string; category: string; visibility: 'public' | 'mentors' | 'students' | 'admin-mentors' }) => void;
  onAddReply: (message: string) => void;
  onUpvote: (postId: string) => void;
  onReportPost: (postId: string, replyId: string | undefined, reason: string) => void;
  onViewPost: (post: CommunityPost) => void;
  selectedPost: CommunityPost | null;
  isNewPostModalOpen: boolean;
  isPostModalOpen: boolean;
  onCloseNewPostModal: () => void;
  onOpenNewPostModal: () => void;
  onClosePostModal: () => void;
  activeTab: 'students' | 'mentor-chats' | 'announcements' | 'admin-mentors';
  onTabChange: (tab: 'students' | 'mentor-chats' | 'announcements' | 'admin-mentors') => void;
  studentsCount: number;
  studentQuestionsCount: number;
  mentorStudentPostsCount: number;
  adminStudentPostsCount: number;
  mentorChatsCount: number;
  announcementsCount: number;
  adminMentorsCount: number;
}

export default function MentorCommunityUI({
  posts,
  loading,
  currentUser,
  onCreatePost,
  onAddReply,
  onUpvote,
  onReportPost,
  onViewPost,
  selectedPost,
  isNewPostModalOpen,
  isPostModalOpen,
  onCloseNewPostModal,
  onOpenNewPostModal,
  onClosePostModal,
  activeTab,
  onTabChange,
  studentsCount,
  studentQuestionsCount,
  mentorStudentPostsCount,
  adminStudentPostsCount,
  mentorChatsCount,
  announcementsCount,
  adminMentorsCount
}: MentorCommunityUIProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading community posts...</div>
        </div>
      </div>
    );
  }

  const getPostTypeForModal = () => {
    switch (activeTab) {
      case 'announcements':
        return 'announcement';
      case 'mentor-chats':
        return 'mentor-chat';
      case 'students':
        return 'student-post';
      case 'admin-mentors':
        return 'admin-mentor-chat';
      default:
        return 'student-post';
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'announcements':
        return '📢 Create Announcement';
      case 'mentor-chats':
        return '👨‍🏫 Create Mentor Chat';
      case 'students':
        return '👥 Create Student Post';
      case 'admin-mentors':
        return '🔒 Create Admin-Mentor Chat';
      default:
        return 'Create Post';
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case 'students':
        return 'All posts visible to students - student questions, mentor posts, and admin posts. Students can reply to posts.';
      case 'announcements':
        return 'Important announcements visible to all students (students can read but not reply)';
      case 'mentor-chats':
        return 'Private discussions between mentors only';
      case 'admin-mentors':
        return 'Private communication channel between mentors and administrators';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mentor Community Forum</h1>
            <p className="text-gray-600 mt-2">
              {getTabDescription()}
            </p>
          </div>
          {currentUser && (
            <button
              onClick={onOpenNewPostModal}
              className={`px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-semibold ${
                activeTab === 'announcements' 
                  ? 'bg-green-600 text-white' 
                  : activeTab === 'students'
                  ? 'bg-blue-600 text-white'
                  : activeTab === 'mentor-chats'
                  ? 'bg-purple-600 text-white'
                  : 'bg-red-600 text-white'
              }`}
            >
              {getCreateButtonText()}
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => onTabChange('students')}
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'students'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍🎓 Students
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                {studentsCount}
              </span>
            </button>
            <button
              onClick={() => onTabChange('announcements')}
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'announcements'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              📢 Announcements
              <span className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                {announcementsCount}
              </span>
            </button>
            <button
              onClick={() => onTabChange('mentor-chats')}
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'mentor-chats'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍🏫 Mentor Chats
              <span className="ml-2 bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-xs">
                {mentorChatsCount}
              </span>
            </button>
            <button
              onClick={() => onTabChange('admin-mentors')}
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'admin-mentors'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🔒 Admin-Mentor
              <span className="ml-2 bg-red-100 text-red-600 px-2 py-1 rounded-full text-xs">
                {adminMentorsCount}
              </span>
            </button>
          </div>
        </div>

        {/* Students Tab Stats */}
        {activeTab === 'students' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-blue-800">Students Section</h3>
                <p className="text-blue-600 text-sm">
                  {studentQuestionsCount} student questions • {mentorStudentPostsCount} mentor posts • {adminStudentPostsCount} admin posts
                </p>
              </div>
              {currentUser && (
                <button
                  onClick={onOpenNewPostModal}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  👥 Create Student Post
                </button>
              )}
            </div>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                {activeTab === 'students' 
                  ? 'No student content yet.' 
                  : activeTab === 'announcements'
                  ? 'No announcements yet. Create the first one!'
                  : activeTab === 'mentor-chats'
                  ? 'No mentor chats yet. Start a discussion!'
                  : 'No admin-mentor chats yet. Start a discussion!'}
              </p>
              {activeTab === 'students' && currentUser && (
                <button
                  onClick={onOpenNewPostModal}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold"
                >
                  Create First Student Post
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <MentorPostCard
                key={post._id}
                post={post}
                onViewPost={onViewPost}
                userId={currentUser?.id}
                onUpvote={onUpvote}
                onReportPost={onReportPost}
                currentUser={currentUser}
              />
            ))
          )}
        </div>

        {/* Login Prompt */}
        {!currentUser && (
          <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-lg mb-4">
              Please log in to access mentor features
            </p>
            <button className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition-colors">
              Log In
            </button>
          </div>
        )}

        {/* Modals */}
        <NewPostModal
          isOpen={isNewPostModalOpen}
          onClose={onCloseNewPostModal}
          onSubmit={onCreatePost}
          currentUser={currentUser}
          postType={getPostTypeForModal()}
        />

        <PostDetailsModal
          post={selectedPost}
          isOpen={isPostModalOpen}
          onClose={onClosePostModal}
          onAddReply={onAddReply}
          onReportPost={onReportPost}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}