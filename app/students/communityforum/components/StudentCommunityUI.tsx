'use client';

import { useState } from 'react'; 
import { CommunityPost } from '@/types/community';
import StudentPostCard from './StudentPostCard';
import NewPostModal from './NewPostModal';
import PostDetailsModal from './PostDetailsModal';

interface StudentCommunityUIProps {
  posts: CommunityPost[];
  loading: boolean;
  currentUser: any;
  onCreatePost: (data: { title: string; content: string; category: string; visibility: 'public' | 'students' }) => void;
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
  activeTab: 'student-chats' | 'mentor-qa' | 'announcements';
  onTabChange: (tab: 'student-chats' | 'mentor-qa' | 'announcements') => void;
  studentChatsCount: number;
  mentorQACount: number;
  announcementsCount: number;
}

export default function StudentCommunityUI({
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
  studentChatsCount,
  mentorQACount,
  announcementsCount
}: StudentCommunityUIProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">Loading community posts...</div>
        </div>
      </div>
    );
  }

  const getTabDescription = () => {
    switch (activeTab) {
      case 'student-chats':
        return 'Private discussions between students only (mentors cannot see these)';
      case 'mentor-qa':
        return 'Ask questions to mentors and see posts created by mentors for students';
      case 'announcements':
        return 'Important announcements from mentors and administrators (read-only)';
      default:
        return '';
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'student-chats':
        return '👥 Create Student Chat';
      case 'mentor-qa':
        return '💬 Ask Mentor Question';
      default:
        return 'Create Post';
    }
  };

  const getPostVisibility = () => {
    switch (activeTab) {
      case 'student-chats':
        return 'students';
      case 'mentor-qa':
        return 'public';
      default:
        return 'public';
    }
  };

  const handleCreatePost = (data: { 
    title: string; 
    content: string; 
    category: string;
    visibility: 'public' | 'students';
  }) => {
    onCreatePost(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Community Forum</h1>
            <p className="text-gray-600 mt-2">
              {getTabDescription()}
            </p>
          </div>
          {currentUser && activeTab !== 'announcements' && (
            <button
              onClick={onOpenNewPostModal}
              className={`px-6 py-3 rounded-lg hover:opacity-90 transition-colors font-semibold ${
                activeTab === 'student-chats' 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-blue-600 text-white'
              }`}
            >
              {getCreateButtonText()}
            </button>
          )}
        </div>

        {/* Tabs - REMOVE ADMIN POSTS TAB */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => onTabChange('student-chats')}
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'student-chats'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👥 Student Chats
              <span className="ml-2 bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                {studentChatsCount}
              </span>
            </button>
            <button
              onClick={() => onTabChange('mentor-qa')}
              className={`flex-1 py-4 px-4 text-center font-medium ${
                activeTab === 'mentor-qa'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              👨‍🏫 Mentor Q&A
              <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs">
                {mentorQACount}
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
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">
                {activeTab === 'student-chats'
                  ? 'No student chats yet. Start a private discussion!'
                  : activeTab === 'mentor-qa'
                  ? 'No mentor questions yet. Ask your first question!'
                  : 'No announcements at the moment.'}
              </p>
              {currentUser && activeTab !== 'announcements' && (
                <button
                  onClick={onOpenNewPostModal}
                  className={`mt-4 px-6 py-2 rounded-lg text-white font-semibold ${
                    activeTab === 'student-chats' ? 'bg-orange-600' : 'bg-blue-600'
                  }`}
                >
                  {getCreateButtonText()}
                </button>
              )}
            </div>
          ) : (
            posts.map((post) => (
              <StudentPostCard
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
              Please log in to participate in discussions
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
          onSubmit={handleCreatePost}
          currentUser={currentUser}
          defaultVisibility={getPostVisibility()}
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