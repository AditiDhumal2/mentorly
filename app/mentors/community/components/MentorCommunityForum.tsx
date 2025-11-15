'use client';

import { useState, useEffect } from 'react';
import { CommunityPost } from '@/types/community';
import { getMentorCommunityPosts, addCommunityPostAction, replyToPostAction, upvotePostAction, reportPostAction } from '@/actions/communityforum-mentor-actions';
import MentorCommunityUI from './MentorCommunityUI';
import { getCurrentMentorSession } from '@/actions/mentor-actions';

interface MentorCommunityForumProps {
  initialPosts: CommunityPost[];
}

// Helper function to filter out posts with invalid categories
function filterValidPosts(posts: any[]): CommunityPost[] {
  return posts.filter(post => {
    const validCategories: CommunityPost['category'][] = ['general', 'academic', 'career', 'technical', 'announcement', 'mentor-question'];
    return validCategories.includes(post.category);
  }) as CommunityPost[];
}

// Mock mentor data for development
const MOCK_MENTOR = {
  id: '67a2b1c3d4e5f67890123456', // Valid 24-character hex string
  name: 'Demo Mentor',
  role: 'mentor' as const
};

export default function MentorCommunityForum({ initialPosts }: MentorCommunityForumProps) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [posts, setPosts] = useState<CommunityPost[]>(filterValidPosts(initialPosts));
  const [loading, setLoading] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'students' | 'mentor-chats' | 'announcements' | 'admin-mentors'>('students');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const session = await getCurrentMentorSession();
        console.log('Mentor session:', session); // Debug log
        
        if (session.isLoggedIn && session.mentor) {
          // Handle different possible mentor object structures
          const mentorData = session.mentor as any;
          setCurrentUser({
            id: mentorData.id || mentorData._id?.toString() || MOCK_MENTOR.id,
            name: mentorData.name || mentorData.userName || MOCK_MENTOR.name,
            role: 'mentor'
          });
        } else {
          // For development, use mock data with valid ObjectId
          console.log('No mentor session found, using mock data');
          setCurrentUser(MOCK_MENTOR);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Use mock data for development with valid ObjectId
        setCurrentUser(MOCK_MENTOR);
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
      const updatedPosts = await getMentorCommunityPosts();
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
    visibility: 'public' | 'mentors' | 'students' | 'admin-mentors';
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
        userRole: 'mentor',
        category: data.category as CommunityPost['category'],
        visibility: data.visibility
      });

      if (result.success) {
        let successMessage = 'Post created successfully!';
        if (data.category === 'announcement') successMessage = 'Announcement created successfully!';
        if (data.visibility === 'students') successMessage = 'Student post created successfully!';
        if (data.visibility === 'mentors') successMessage = 'Mentor chat created successfully!';
        if (data.visibility === 'admin-mentors') successMessage = 'Admin-mentor chat created successfully!';
        
        showSnackbar(successMessage);
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
        userRole: 'mentor',
        message
      });

      if (result.success) {
        showSnackbar('Reply added successfully!');
        await loadPosts();
        
        // Refresh the selected post
        const updatedPosts = await getMentorCommunityPosts();
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
          const updatedPosts = await getMentorCommunityPosts();
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
      const result = await reportPostAction(postId, replyId, reason, currentUser.id, 'mentor');
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

  // Filter posts based on active tab - FIXED FOR STUDENTS SECTION
  const filteredPosts = posts.filter(post => {
    switch (activeTab) {
      case 'students':
        // Show ALL posts that are visible to students (public, students visibility, and announcements)
        return (
          post.visibility === 'public' || 
          post.visibility === 'students' || 
          post.category === 'announcement'
        ) && post.category !== 'announcement'; // Exclude announcements from students tab (they have their own tab)
      case 'announcements':
        return post.category === 'announcement';
      case 'mentor-chats':
        return post.visibility === 'mentors';
      case 'admin-mentors':
        return post.visibility === 'admin-mentors';
      default:
        return false;
    }
  });

  // Calculate counts based on proper filtering - FIXED FOR STUDENTS SECTION
  const studentQuestionsCount = posts.filter(post => 
    post.visibility === 'public' && post.userRole === 'student' && post.category !== 'announcement'
  ).length;

  const mentorStudentPostsCount = posts.filter(post => 
    post.visibility === 'students' && post.userRole === 'mentor'
  ).length;

  const adminStudentPostsCount = posts.filter(post => 
    (post.visibility === 'public' || post.visibility === 'students') && post.userRole === 'admin'
  ).length;

  const studentsCount = posts.filter(post => 
    (post.visibility === 'public' || post.visibility === 'students') && post.category !== 'announcement'
  ).length;

  const mentorChatsCount = posts.filter(post => 
    post.visibility === 'mentors'
  ).length;

  const announcementsCount = posts.filter(post => 
    post.category === 'announcement'
  ).length;

  const adminMentorsCount = posts.filter(post => 
    post.visibility === 'admin-mentors'
  ).length;

  return (
    <>
      <MentorCommunityUI
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
        studentsCount={studentsCount}
        studentQuestionsCount={studentQuestionsCount}
        mentorStudentPostsCount={mentorStudentPostsCount}
        adminStudentPostsCount={adminStudentPostsCount}
        mentorChatsCount={mentorChatsCount}
        announcementsCount={announcementsCount}
        adminMentorsCount={adminMentorsCount}
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