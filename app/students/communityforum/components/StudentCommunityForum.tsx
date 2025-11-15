'use client';

import { useState, useEffect } from 'react';
import { CommunityPost } from '@/types/community';
import { getStudentCommunityPosts, addCommunityPostAction, replyToPostAction, upvotePostAction, reportPostAction } from '@/actions/communityforum-students-actions';
import StudentCommunityUI from './StudentCommunityUI';
import { getCurrentStudentSession } from '@/actions/userActions';

interface StudentCommunityForumProps {
  initialPosts: CommunityPost[];
}

// Helper function to filter out posts with invalid categories
function filterValidPosts(posts: any[]): CommunityPost[] {
  return posts.filter(post => {
    const validCategories: CommunityPost['category'][] = ['general', 'academic', 'career', 'technical', 'announcement', 'mentor-question'];
    return validCategories.includes(post.category);
  }) as CommunityPost[];
}

export default function StudentCommunityForum({ initialPosts }: StudentCommunityForumProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(filterValidPosts(initialPosts));
  const [loading, setLoading] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'student-chats' | 'mentor-qa' | 'announcements'>('student-chats');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const session = await getCurrentStudentSession();
        if (session.isLoggedIn && session.student) {
          setCurrentUser({
            id: session.student.id,
            name: session.student.name,
            role: 'student'
          });
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const updatedPosts = await getStudentCommunityPosts();
      setPosts(filterValidPosts(updatedPosts));
    } catch (error) {
      console.error('Error loading posts:', error);
      showSnackbar('Failed to load posts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (data: { 
    title: string; 
    content: string; 
    category: string;
    visibility: 'public' | 'students';
  }) => {
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
        userRole: 'student',
        category: data.category as CommunityPost['category']
      });

      if (result.success) {
        showSnackbar('Post created successfully!');
        await loadPosts();
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

  const handleAddReply = async (message: string) => {
    if (!selectedPost?._id || !currentUser) {
      showSnackbar('Please log in to reply to posts', 'error');
      return;
    }

    try {
      const result = await replyToPostAction(selectedPost._id, {
        userId: currentUser.id,
        userName: currentUser.name,
        userRole: 'student',
        message
      });

      if (result.success) {
        showSnackbar('Reply added successfully!');
        await loadPosts();
        
        // Refresh the selected post
        const updatedPosts = await getStudentCommunityPosts();
        const updatedPost = filterValidPosts(updatedPosts).find(p => p._id === selectedPost._id);
        if (updatedPost) {
          setSelectedPost(updatedPost);
        }
      } else {
        showSnackbar(result.error || 'Failed to add reply', 'error');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      showSnackbar('Failed to add reply', 'error');
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
        await loadPosts();
        
        // Update selected post if open
        if (selectedPost && selectedPost._id === postId) {
          const updatedPosts = await getStudentCommunityPosts();
          const updatedPost = filterValidPosts(updatedPosts).find(p => p._id === postId);
          if (updatedPost) {
            setSelectedPost(updatedPost);
          }
        }
      } else {
        showSnackbar(result.error || 'Failed to upvote post', 'error');
      }
    } catch (error) {
      console.error('Error upvoting post:', error);
      showSnackbar('Failed to upvote post', 'error');
    }
  };

  const handleReportPost = async (postId: string, replyId: string | undefined, reason: string) => {
    if (!currentUser) {
      showSnackbar('Please log in to report content', 'error');
      return;
    }

    try {
      const result = await reportPostAction(postId, replyId, reason, currentUser.id, 'student');
      if (result.success) {
        showSnackbar('Content reported successfully. Moderators will review it.');
      } else {
        showSnackbar(result.error || 'Failed to report content', 'error');
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      showSnackbar('Failed to report content', 'error');
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

  // Filter posts based on active tab - REMOVE ADMIN POSTS FILTERING
  const filteredPosts = posts.filter(post => {
    switch (activeTab) {
      case 'student-chats':
        // Private student chats - only students can see these
        return post.visibility === 'students' && post.userRole === 'student';
      case 'mentor-qa':
        // Mentor posts for students and student questions for mentors
        return (post.visibility === 'public' && post.userRole === 'student') || 
               (post.visibility === 'students' && post.userRole === 'mentor');
      case 'announcements':
        return post.category === 'announcement';
      default:
        return false;
    }
  });

  // Calculate counts - REMOVE ADMIN POSTS COUNT
  const studentChatsCount = posts.filter(post => 
    post.visibility === 'students' && post.userRole === 'student'
  ).length;

  const mentorQACount = posts.filter(post => 
    (post.visibility === 'public' && post.userRole === 'student') || 
    (post.visibility === 'students' && post.userRole === 'mentor')
  ).length;

  const announcementsCount = posts.filter(post => 
    post.category === 'announcement'
  ).length;

  return (
    <>
      <StudentCommunityUI
        posts={filteredPosts}
        loading={loading}
        currentUser={currentUser}
        onCreatePost={handleCreatePost}
        onAddReply={handleAddReply}
        onUpvote={handleUpvote}
        onReportPost={handleReportPost}
        onViewPost={handleViewPost}
        selectedPost={selectedPost}
        isNewPostModalOpen={isNewPostModalOpen}
        isPostModalOpen={isPostModalOpen}
        onCloseNewPostModal={() => setIsNewPostModalOpen(false)}
        onOpenNewPostModal={() => setIsNewPostModalOpen(true)}
        onClosePostModal={handleClosePostModal}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        studentChatsCount={studentChatsCount}
        mentorQACount={mentorQACount}
        announcementsCount={announcementsCount}
      />
      
      {/* Snackbar Component */}
      {snackbar.open && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
          snackbar.severity === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {snackbar.message}
          <button 
            onClick={closeSnackbar}
            className="ml-4 font-bold"
          >
            ×
          </button>
        </div>
      )}
    </>
  );
}