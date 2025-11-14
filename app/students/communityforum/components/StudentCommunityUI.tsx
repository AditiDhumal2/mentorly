'use client';

import { useState } from 'react'; 
import { CommunityPost } from '@/types/community';
import StudentPostCard from './StudentPostCard';
import NewPostModal from './NewPostModal';
import PostDetailsModal from './PostDetailsModal';
import AskMentorModal from './AskMentorModal';

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
  onClosePostModal
}: StudentCommunityUIProps) {
  const [isAskMentorModalOpen, setIsAskMentorModalOpen] = useState(false); // ADD THIS STATE

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">Loading community posts...</div>
        </div>
      </div>
    );
  }

  const publicPosts = posts.filter(post => post.visibility === 'public');
  const studentPosts = posts.filter(post => post.visibility === 'students');

  const handleAskMentorSubmit = (data: {
    title: string;
    content: string;
    category: string;
    selectedMentorId?: string;
  }) => {
    // Convert mentor-specific post to regular post with student visibility
    onCreatePost({
      title: data.title,
      content: data.content,
      category: data.category,
      visibility: 'students' // FIXED: Use 'students' instead of 'mentors'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Student Community Forum</h1>
            <p className="text-gray-600 mt-2">
              Connect with fellow students and mentors. Ask questions, share experiences, and grow together.
            </p>
          </div>
          {currentUser && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsAskMentorModalOpen(true)}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              >
                🎯 Ask a Mentor
              </button>
              <button
                onClick={onOpenNewPostModal}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Create Post
              </button>
            </div>
          )}
        </div>

        {/* Ask Mentor Section */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-4">🎯 Need Expert Help?</h2>
                <p className="text-purple-100 text-lg mb-6">
                  Get personalized guidance from experienced mentors. Ask specific questions and get expert answers tailored to your needs.
                </p>
                <ul className="space-y-2 text-purple-100">
                  <li>✅ Get help from industry professionals</li>
                  <li>✅ One-on-one mentorship opportunities</li>
                  <li>✅ Career guidance and technical advice</li>
                  <li>✅ Fast responses from verified mentors</li>
                </ul>
              </div>
              {currentUser && (
                <div className="mt-6 lg:mt-0 lg:ml-8">
                  <button
                    onClick={() => setIsAskMentorModalOpen(true)}
                    className="bg-white text-purple-600 px-8 py-4 rounded-xl hover:bg-purple-50 transition-colors font-bold text-lg shadow-lg"
                  >
                    Ask a Mentor Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Public Posts Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">📢 Public Discussions</h2>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {publicPosts.length} posts
            </span>
          </div>
          
          <div className="space-y-6">
            {publicPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No public posts yet. Be the first to start a discussion!</p>
              </div>
            ) : (
              publicPosts.map((post) => (
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
        </section>

        {/* Student-Only Posts Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">👥 Student-Only Chats</h2>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              {studentPosts.length} posts
            </span>
          </div>
          
          <div className="space-y-6">
            {studentPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-500 text-lg">No student-only posts yet. Start a private discussion with other students!</p>
              </div>
            ) : (
              studentPosts.map((post) => (
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
        </section>

        {/* Login Prompt */}
        {!currentUser && (
          <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-yellow-800 text-lg mb-4">
              Please log in to participate in discussions and ask mentors
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
        />

        <PostDetailsModal
          post={selectedPost}
          isOpen={isPostModalOpen}
          onClose={onClosePostModal}
          onAddReply={onAddReply}
          onReportPost={onReportPost}
          currentUser={currentUser}
        />

        <AskMentorModal
          isOpen={isAskMentorModalOpen}
          onClose={() => setIsAskMentorModalOpen(false)}
          onSubmit={handleAskMentorSubmit}
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}