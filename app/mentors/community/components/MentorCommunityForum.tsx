'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommunityPost } from '@/types/community';
import MentorCommunityUI from './MentorCommunityUI';
import { addCommunityPostAction, replyToPostAction, upvotePostAction, reportPostAction } from '@/actions/communityforum-mentor-actions';

interface MentorCommunityForumProps {
  initialPosts: CommunityPost[];
  currentCategory?: string;
  currentUser?: any; // Add currentUser prop
}

export default function MentorCommunityForum({ 
  initialPosts, 
  currentCategory,
  currentUser: propCurrentUser // Get user from props
}: MentorCommunityForumProps) {
  const [currentUser, setCurrentUser] = useState<any>(propCurrentUser); // Use prop as initial state
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // For announcement category, only show announcements tab
  const defaultTab = currentCategory === 'announcement' ? 'announcements' : 'students';
  const [activeTab, setActiveTab] = useState<'students' | 'mentor-chats' | 'admin-mentors' | 'announcements'>(defaultTab);
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  const router = useRouter();

  // Use the user from props, don't override with demo user
  useEffect(() => {
    if (propCurrentUser) {
      setCurrentUser(propCurrentUser);
      console.log('✅ MentorCommunityForum - Using actual user:', propCurrentUser.name);
    } else {
      console.log('❌ MentorCommunityForum - No user provided, user will be null');
    }
  }, [propCurrentUser]);

  // Reset to announcements tab when category is announcement
  useEffect(() => {
    if (currentCategory === 'announcement') {
      setActiveTab('announcements');
    }
  }, [currentCategory]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      // You might need to implement a function to reload posts
      // For now, we'll keep using the initial posts
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
        userId: currentUser.id || currentUser._id, // Handle both id formats
        userName: currentUser.name,
        userRole: 'mentor',
        category: data.category as CommunityPost['category'],
        visibility: data.visibility
      });

      if (result.success) {
        let successMessage = 'Post created successfully!';
        if (data.visibility === 'students') successMessage = 'Student post created successfully!';
        if (data.visibility === 'mentors') successMessage = 'Mentor chat created successfully!';
        if (data.visibility === 'admin-mentors') successMessage = 'Admin-mentor chat created successfully!';
        
        showSnackbar(successMessage);
        // Refresh the page to see the new post
        window.location.reload();
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
        userId: currentUser.id || currentUser._id, // Handle both id formats
        userName: currentUser.name,
        userRole: 'mentor',
        message
      });

      if (result.success) {
        showSnackbar('Reply added successfully!');
        // Update local state
        const updatedPosts = [...posts];
        const postIndex = updatedPosts.findIndex(p => p._id === selectedPost._id);
        if (postIndex !== -1) {
          const updatedPost = { ...updatedPosts[postIndex] };
          updatedPost.replies = [...updatedPost.replies, {
            _id: Date.now().toString(), // Temporary ID
            userId: currentUser.id || currentUser._id,
            userName: currentUser.name,
            userRole: 'mentor',
            message,
            createdAt: new Date().toISOString(),
            isDeleted: false
          }];
          updatedPosts[postIndex] = updatedPost;
          setPosts(updatedPosts);
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
      const result = await upvotePostAction(postId, currentUser.id || currentUser._id);
      if (result.success) {
        // Update local state
        const updatedPosts = posts.map(post => {
          if (post._id === postId) {
            const hasUpvoted = post.upvotes.includes(currentUser.id || currentUser._id);
            return {
              ...post,
              upvotes: hasUpvoted 
                ? post.upvotes.filter(id => id !== (currentUser.id || currentUser._id))
                : [...post.upvotes, currentUser.id || currentUser._id]
            };
          }
          return post;
        });
        setPosts(updatedPosts);
        
        // Update selected post if open
        if (selectedPost && selectedPost._id === postId) {
          const updatedPost = updatedPosts.find(p => p._id === postId);
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
      const result = await reportPostAction(postId, replyId, reason, currentUser.id || currentUser._id, 'mentor');
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

  const getCategoryName = (categoryId: string) => {
    const categoryMap: { [key: string]: string } = {
      'higher-education': 'Higher Education',
      'market-trends': 'Market Trends',
      'domains': 'Domains & Specializations',
      'placements': 'Placements & Careers',
      'announcements': 'Announcements',
      'general': 'General Discussion',
      'mentor-chats': 'Mentor Discussions',
      'admin-mentors': 'Admin-Mentor Chats'
    };
    return categoryMap[categoryId] || categoryId;
  };

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    switch (activeTab) {
      case 'students':
        // Show ALL posts that are visible to students (public, students visibility)
        return (
          post.visibility === 'public' || 
          post.visibility === 'students'
        );
      case 'mentor-chats':
        return post.visibility === 'mentors';
      case 'admin-mentors':
        return post.visibility === 'admin-mentors';
      case 'announcements':
        return post.category === 'announcement';
      default:
        return false;
    }
  });

  // Calculate counts
  const studentsCount = posts.filter(post => 
    (post.visibility === 'public' || post.visibility === 'students')
  ).length;

  const studentQuestionsCount = posts.filter(post => 
    post.visibility === 'public' && post.userRole === 'student'
  ).length;

  const mentorStudentPostsCount = posts.filter(post => 
    post.visibility === 'students' && post.userRole === 'mentor'
  ).length;

  const adminStudentPostsCount = posts.filter(post => 
    (post.visibility === 'public' || post.visibility === 'students') && post.userRole === 'admin'
  ).length;

  const mentorChatsCount = posts.filter(post => 
    post.visibility === 'mentors'
  ).length;

  const adminMentorsCount = posts.filter(post => 
    post.visibility === 'admin-mentors'
  ).length;

  const announcementsCount = posts.filter(post => 
    post.category === 'announcement'
  ).length;

  console.log('📊 Mentor Forum - Current User:', currentUser?.name);
  console.log('📊 Mentor Forum - Current Category:', currentCategory);
  console.log('📊 Mentor Forum - Active Tab:', activeTab);

  // If we have a current category, show category header
  if (currentCategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Category Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => router.push('/mentors/community')}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>All Categories</span>
                </button>
                <div className="h-6 w-px bg-gray-300"></div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    {getCategoryName(currentCategory)}
                  </h1>
                  <p className="text-gray-600">
                    Posts in {getCategoryName(currentCategory)} category
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {posts.length} posts
              </div>
            </div>
          </div>
        </div>

        {/* Existing MentorCommunityUI */}
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
          adminMentorsCount={adminMentorsCount}
          announcementsCount={announcementsCount}
          currentCategory={currentCategory}
        />
        
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
      </div>
    );
  }

  return null;
}