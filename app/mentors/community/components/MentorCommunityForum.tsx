// app/mentors/community/components/MentorCommunityForum.tsx
'use client';

import { useState, useEffect } from 'react';
import { CommunityPost } from '@/types/community';
import { addCommunityPostAction, replyToPostAction, upvotePostAction, getPostById } from '@/actions/communityforum-mentor-actions';
import CommunityForum from './CommunityForum';
import { getCurrentMentorSession } from '@/actions/userActions';
import Snackbar from '@/components/Snackbar';

interface MentorCommunityForumProps {
  initialPosts: CommunityPost[];
}

export default function MentorCommunityForum({ initialPosts }: MentorCommunityForumProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch current mentor - ONLY ONCE
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const session = await getCurrentMentorSession();
        if (session.isLoggedIn && session.mentor) {
          setCurrentUser({
            id: session.mentor.id,
            name: session.mentor.name,
            email: session.mentor.email,
            role: 'mentor'
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleCreatePost = async (data: { title: string; content: string; category: string }) => {
    if (!currentUser) {
      showSnackbar('Please log in to create a post', 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await addCommunityPostAction({
        ...data,
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'mentor',
        category: data.category as 'query' | 'discussion' | 'announcement'
      });

      if (result.success && result.post) {
        showSnackbar('Post created successfully!');
        // Add new post to beginning of list
        setPosts(prev => [result.post, ...prev]);
        setIsNewPostModalOpen(false);
      } else {
        showSnackbar(result.error || 'Failed to create post', 'error');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      showSnackbar('Failed to create post', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!currentUser) {
      showSnackbar('Please log in to upvote posts', 'error');
      return;
    }

    try {
      const result = await upvotePostAction(postId, currentUser.id);
      if (result.success) {
        // Optimistic update
        setPosts(prev => prev.map(post => {
          if (post._id === postId) {
            const isUpvoted = post.upvotes?.includes(currentUser.id);
            return {
              ...post,
              upvotes: isUpvoted 
                ? post.upvotes.filter(id => id !== currentUser.id)
                : [...(post.upvotes || []), currentUser.id]
            };
          }
          return post;
        }));

        // Update selected post if open
        if (selectedPost && selectedPost._id === postId) {
          const isUpvoted = selectedPost.upvotes?.includes(currentUser.id);
          setSelectedPost({
            ...selectedPost,
            upvotes: isUpvoted 
              ? selectedPost.upvotes.filter(id => id !== currentUser.id)
              : [...(selectedPost.upvotes || []), currentUser.id]
          });
        }
      } else {
        showSnackbar(result.error || 'Failed to upvote post', 'error');
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
      showSnackbar('Failed to upvote post', 'error');
    }
  };

  const handleAddReply = async (message: string) => {
    if (!selectedPost?._id || !currentUser) {
      showSnackbar('Please log in to reply to posts', 'error');
      return;
    }

    try {
      const result = await replyToPostAction(selectedPost._id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'mentor',
        message
      });

      if (result.success) {
        showSnackbar('Reply added successfully!');
        
        // Refresh the specific post
        const updatedPost = await getPostById(selectedPost._id);
        if (updatedPost) {
          setSelectedPost(updatedPost);
          // Update in main list
          setPosts(prev => prev.map(post => 
            post._id === selectedPost._id ? updatedPost : post
          ));
        }
      } else {
        showSnackbar(result.error || 'Failed to add reply', 'error');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showSnackbar('Failed to add reply', 'error');
    }
  };

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setTimeout(() => setSelectedPost(null), 300);
  };

  return (
    <>
      <CommunityForum
        posts={posts}
        loading={loading}
        onCreatePost={handleCreatePost}
        onAddReply={handleAddReply}
        onUpvote={handleUpvote}
        onViewPost={handleViewPost}
        selectedPost={selectedPost}
        isNewPostModalOpen={isNewPostModalOpen}
        isPostModalOpen={isPostModalOpen}
        onCloseNewPostModal={() => setIsNewPostModalOpen(false)}
        onOpenNewPostModal={() => setIsNewPostModalOpen(true)}
        onClosePostModal={handleClosePostModal}
        currentUserId={currentUser?.id}
        currentUserRole={currentUser?.role}
      />
      
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={closeSnackbar}
        autoHideDuration={4000}
      />
    </>
  );
}