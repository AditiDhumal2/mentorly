// app/students/communityforum/StudentCommunityForum.tsx
'use client';

import { useState, useEffect } from 'react';
import { CommunityPost } from '@/types/community';
import { addCommunityPostAction, replyToPostAction, upvotePostAction } from '@/actions/communityforum-students-actions';
import CommunityForum from './components/CommunityForum';
import { getCurrentStudentSession } from '@/actions/userActions';
import Snackbar from '@/components/Snackbar';

interface StudentCommunityForumProps {
  initialPosts: CommunityPost[];
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  year: number;
  college: string;
  profiles: any;
  interests: string[];
}

export default function StudentCommunityForum({ initialPosts }: StudentCommunityForumProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        console.log('🔍 Fetching current student session...');
        const session = await getCurrentStudentSession();
        
        if (session.isLoggedIn && session.student) {
          console.log('✅ Student session found:', session.student.name);
          setCurrentUser({
            id: session.student.id,
            name: session.student.name,
            email: session.student.email,
            role: session.student.role,
            year: session.student.year,
            college: session.student.college,
            profiles: session.student.profiles || {},
            interests: session.student.interests || []
          });
        } else {
          console.log('❌ No student session found');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('❌ Error fetching current user:', error);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      window.location.reload();
    } catch (error) {
      console.error('Error loading posts:', error);
      showSnackbar('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (data: { title: string; content: string; category: string }) => {
    if (!currentUser) {
      showSnackbar('Please log in to create a post', 'error');
      return;
    }

    console.log('📝 Creating post with user:', currentUser.name);

    const result = await addCommunityPostAction({
      ...data,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'student' as const,
      category: data.category as 'query' | 'discussion' | 'announcement'
    });

    if (result.success) {
      console.log('✅ Post created successfully');
      showSnackbar('Post created successfully!');
      await loadPosts();
      setIsNewPostModalOpen(false);
    } else {
      showSnackbar(result.error || 'Failed to create post', 'error');
    }
  };

  const handleAddReply = async (message: string) => {
    if (!selectedPost?._id || !currentUser) {
      showSnackbar('Please log in to reply to posts', 'error');
      return;
    }

    console.log('💬 Adding reply with user:', currentUser.name);

    const result = await replyToPostAction(selectedPost._id, {
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: 'student' as const,
      message
    });

    if (result.success) {
      console.log('✅ Reply added successfully');
      showSnackbar('Reply added successfully!');
      await loadPosts();
    } else {
      showSnackbar(result.error || 'Failed to add reply', 'error');
    }
  };

  const handleUpvote = async (postId: string) => {
    if (!currentUser) {
      showSnackbar('Please log in to upvote posts', 'error');
      return;
    }

    console.log('👍 Upvoting post with user:', currentUser.name);

    const result = await upvotePostAction(postId, currentUser.id);
    if (result.success) {
      console.log('✅ Post upvoted successfully');
      await loadPosts();
    } else {
      showSnackbar(result.error || 'Failed to upvote post', 'error');
    }
  };

  const handleViewPost = (post: CommunityPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
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
        onClosePostModal={() => {
          setIsPostModalOpen(false);
          setSelectedPost(null);
        }}
        currentUserId={currentUser?.id}
        currentUserRole="student"
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