'use client';

import { CommunityPost } from '@/types/community';
import PostCard from './PostCard';
import NewPostModal from './NewPostModal';
import PostDetailsModal from './PostDetailsModal';

interface CommunityForumProps {
  posts: CommunityPost[];
  loading: boolean;
  onCreatePost: (data: { title: string; content: string; category: string }) => void;
  onAddReply: (message: string) => void;
  onUpvote: (postId: string) => void;
  onViewPost: (post: CommunityPost) => void;
  selectedPost: CommunityPost | null;
  isNewPostModalOpen: boolean;
  isPostModalOpen: boolean;
  onCloseNewPostModal: () => void;
  onOpenNewPostModal: () => void;
  onClosePostModal: () => void;
  currentUserId?: string;
}

export default function CommunityForum({
  posts,
  loading,
  onCreatePost,
  onAddReply,
  onUpvote,
  onViewPost,
  selectedPost,
  isNewPostModalOpen,
  isPostModalOpen,
  onCloseNewPostModal,
  onOpenNewPostModal,
  onClosePostModal,
  currentUserId
}: CommunityForumProps) {
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
            <h1 className="text-3xl font-bold text-gray-800">Community Forum</h1>
            <p className="text-gray-600 mt-2">
              Connect with fellow students and mentors. Ask questions, share experiences, and grow together.
            </p>
          </div>
          <button
            onClick={onOpenNewPostModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Create Post
          </button>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No posts yet. Be the first to start a discussion!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                onViewPost={onViewPost}
                userId={currentUserId}
                onUpvote={onUpvote}
              />
            ))
          )}
        </div>

        {/* Modals */}
        <NewPostModal
          isOpen={isNewPostModalOpen}
          onClose={onCloseNewPostModal}
          onSubmit={onCreatePost}
        />

        <PostDetailsModal
          post={selectedPost}
          isOpen={isPostModalOpen}
          onClose={onClosePostModal}
          onAddReply={onAddReply}
          currentUserId={currentUserId}
        />
      </div>
    </div>
  );
}