'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CommunityPost } from '@/types/community';
import StudentCommunityUI from './StudentCommunityUI';
import { addCommunityPostAction, replyToPostAction, upvotePostAction, reportPostAction } from '@/actions/communityforum-students-actions';

interface StudentCommunityForumProps {
  initialPosts: CommunityPost[];
  currentCategory?: string;
  currentUser?: any; // Add currentUser prop
}

export default function StudentCommunityForum({ 
  initialPosts, 
  currentCategory,
  currentUser: propCurrentUser // Get user from props
}: StudentCommunityForumProps) {
  const [currentUser, setCurrentUser] = useState<any>(propCurrentUser); // Use prop as initial state
  const [posts, setPosts] = useState<CommunityPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  
  // For announcement category, only show announcements tab
  const defaultTab = currentCategory === 'announcement' ? 'announcements' : 'student-chats';
  const [activeTab, setActiveTab] = useState<'student-chats' | 'mentor-qa' | 'announcements'>(defaultTab);
  
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
      console.log('✅ StudentCommunityForum - Using actual user:', propCurrentUser.name);
    } else {
      console.log('❌ StudentCommunityForum - No user provided, user will be null');
    }
  }, [propCurrentUser]);

  // Reset to announcements tab when category is announcement
  useEffect(() => {
    if (currentCategory === 'announcement') {
      setActiveTab('announcements');
    }
  }, [currentCategory]);

  // Update posts when initialPosts changes
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const showSnackbar = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const closeSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
        userId: currentUser.id || currentUser._id, // Handle both id formats
        userName: currentUser.name,
        userRole: 'student',
        category: data.category as CommunityPost['category']
      });

      if (result.success) {
        showSnackbar('Post created successfully!');
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

    // Prevent replying to announcements
    if (selectedPost.category === 'announcement') {
      showSnackbar('Cannot reply to announcements', 'error');
      return;
    }

    try {
      const result = await replyToPostAction(selectedPost._id, {
        userId: currentUser.id || currentUser._id, // Handle both id formats
        userName: currentUser.name,
        userRole: 'student',
        message
      });

      if (result.success) {
        showSnackbar('Reply added successfully!');
        // Refresh the selected post
        const updatedPosts = [...posts];
        const postIndex = updatedPosts.findIndex(p => p._id === selectedPost._id);
        if (postIndex !== -1) {
          const updatedPost = { ...updatedPosts[postIndex] };
          updatedPost.replies = [...updatedPost.replies, {
            _id: Date.now().toString(), // Temporary ID
            userId: currentUser.id || currentUser._id,
            userName: currentUser.name,
            userRole: 'student',
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
      const result = await reportPostAction(postId, replyId, reason, currentUser.id || currentUser._id, 'student');
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
      'announcement': 'Announcements',
      'announcements': 'Announcements',
      'general': 'General Discussion',
      'academic': 'Academic Help',
      'career': 'Career Advice',
      'technical': 'Technical Help'
    };
    return categoryMap[categoryId] || categoryId;
  };

  // Filter posts based on active tab - SIMPLIFIED LOGIC
  const filteredPosts = posts.filter(post => {
    // If we're in announcement category, show all announcements
    if (currentCategory === 'announcement' || currentCategory === 'announcements') {
      return post.category === 'announcement';
    }
    
    switch (activeTab) {
      case 'student-chats':
        // Private student chats - only students can see these
        return post.visibility === 'students' && post.userRole === 'student';
      case 'mentor-qa':
        // Mentor posts for students and student questions for mentors
        return (post.visibility === 'public' && post.userRole === 'student') || 
               (post.visibility === 'students' && post.userRole === 'mentor') ||
               (post.category === 'announcement');
      case 'announcements':
        // All announcements (read-only for students)
        return post.category === 'announcement';
      default:
        return true;
    }
  });

  // Calculate counts
  const studentChatsCount = posts.filter(post => 
    post.visibility === 'students' && post.userRole === 'student'
  ).length;

  const mentorQACount = posts.filter(post => 
    (post.visibility === 'public' && post.userRole === 'student') || 
    (post.visibility === 'students' && post.userRole === 'mentor') ||
    (post.category === 'announcement')
  ).length;

  const announcementsCount = posts.filter(post => 
    post.category === 'announcement'
  ).length;

  console.log('📊 Student Forum - Current User:', currentUser?.name);
  console.log('📊 Student Forum - Current Category:', currentCategory);
  console.log('📊 Student Forum - Active Tab:', activeTab);
  console.log('📊 Student Forum - Total Posts:', posts.length);
  console.log('📊 Student Forum - Filtered Posts:', filteredPosts.length);
  console.log('📊 Student Forum - Announcements Count:', announcementsCount);

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
                  onClick={() => router.push('/students/communityforum')}
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
                {filteredPosts.length} posts
              </div>
            </div>
          </div>
        </div>

        {/* Existing StudentCommunityUI */}
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

  // This should not be reached due to the conditional above, but return null for safety
  return null;
}