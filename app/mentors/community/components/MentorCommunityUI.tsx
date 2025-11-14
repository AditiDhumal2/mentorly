'use client';

import { CommunityPost } from '@/types/community';
import MentorPostCard from './PostCard';
import NewPostModal from './NewPostModal';
import PostDetailsModal from './PostDetailsModal';

interface MentorCommunityUIProps {
  posts: CommunityPost[];
  loading: boolean;
  currentUser: any;
  onCreatePost: (data: { title: string; content: string; category: string; visibility: 'public' | 'students' | 'mentors' }) => void;
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
  activeTab: 'all' | 'student-questions' | 'mentor-chats';
  onTabChange: (tab: 'all' | 'student-questions' | 'mentor-chats') => void;
  studentQuestionsCount: number;
  mentorChatsCount: number;
  totalPostsCount: number;
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
  studentQuestionsCount,
  mentorChatsCount,
  totalPostsCount
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mentor Community Forum</h1>
            <p className="text-gray-600 mt-2">
              Help students, collaborate with fellow mentors, and access admin-mentor discussions.
            </p>
          </div>
          {currentUser && (
            <button
              onClick={onOpenNewPostModal}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Create Post
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => onTabChange('all')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'all'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              🌍 All Posts
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {totalPostsCount}
              </span>
            </button>
            <button
              onClick={() => onTabChange('student-questions')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
                activeTab === 'student-questions'
                  ? 'text-green-600 border-b-2 border-green-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍🎓 Student Questions
              <span className="ml-2 bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs">
                {studentQuestionsCount}
              </span>
            </button>
            <button
              onClick={() => onTabChange('mentor-chats')}
              className={`flex-1 py-4 px-6 text-center font-medium ${
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
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                {activeTab === 'student-questions' 
                  ? 'No student questions at the moment.' 
                  : activeTab === 'mentor-chats'
                  ? 'No mentor chats yet. Start a discussion!'
                  : 'No posts found.'}
              </p>
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

        {/* Admin-Mentor Chat Link */}
        {currentUser && (
          <div className="mt-8 text-center">
            <a
              href="/mentors/community/admin-chats"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              🔒 Access Admin-Mentor Private Chats
            </a>
          </div>
        )}

        {/* Modals */}
        <NewPostModal
          isOpen={isNewPostModalOpen}
          onClose={onCloseNewPostModal}
          onSubmit={onCreatePost}
          currentUser={currentUser}
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