import { CommunityPost } from '@/types/community';
import { getAdminCommunityPosts, deletePostAction, deleteReplyAction } from '@/actions/communityforum-admin-actions';
import AdminCommunityForum from './components/AdminCommunityForum';

// Helper function to safely transform the data
function transformPostData(posts: any[]): CommunityPost[] {
  return posts.map(post => {
    // Safely handle createdAt
    const createdAt = post.createdAt instanceof Date 
      ? post.createdAt.toISOString() 
      : typeof post.createdAt === 'string' 
        ? post.createdAt 
        : new Date().toISOString();

    // Safely handle updatedAt - fallback to createdAt if undefined
    const updatedAt = (post as any).updatedAt instanceof Date 
      ? (post as any).updatedAt.toISOString() 
      : typeof (post as any).updatedAt === 'string' 
        ? (post as any).updatedAt 
        : createdAt; // Use createdAt as fallback

    // Safely handle deletedAt
    const deletedAt = (post as any).deletedAt instanceof Date 
      ? (post as any).deletedAt.toISOString() 
      : typeof (post as any).deletedAt === 'string' 
        ? (post as any).deletedAt 
        : undefined;

    // Transform replies to match CommunityReply type
    const transformedReplies: any[] = (post.replies || []).map((reply: any) => {
      const replyCreatedAt = reply.createdAt instanceof Date 
        ? reply.createdAt.toISOString() 
        : typeof reply.createdAt === 'string' 
          ? reply.createdAt 
          : new Date().toISOString();

      return {
        _id: reply._id?.toString() || '',
        userId: reply.userId?.toString() || '',
        userName: reply.userName || 'Unknown User',
        userRole: reply.userRole || 'student',
        message: reply.message || '',
        createdAt: replyCreatedAt,
        isDeleted: reply.isDeleted || false,
        deletedBy: reply.deletedBy?.toString(),
        deletedAt: reply.deletedAt instanceof Date 
          ? reply.deletedAt.toISOString() 
          : typeof reply.deletedAt === 'string' 
            ? reply.deletedAt 
            : undefined
      };
    });

    return {
      _id: post._id.toString(),
      userId: post.userId.toString(),
      userName: post.userName || 'Unknown User',
      userRole: post.userRole || 'student',
      title: post.title || 'No Title',
      content: post.content || 'No Content',
      category: post.category || 'general',
      visibility: (post as any).visibility || 'public',
      replies: transformedReplies,
      upvotes: (post.upvotes || []).map((upvote: any) => upvote.toString()),
      isDeleted: (post as any).isDeleted || false,
      reportCount: (post as any).reportCount || 0,
      deletedBy: (post as any).deletedBy?.toString(),
      deletedAt: deletedAt,
      createdAt: createdAt,
      updatedAt: updatedAt
    };
  });
}

export default async function AdminCommunityForumPage() {
  let posts: CommunityPost[] = [];
  let loading = false;

  try {
    console.log('Fetching admin community posts...');
    const fetchedPosts = await getAdminCommunityPosts();
    console.log('Raw posts data received:', fetchedPosts?.length || 0);
    
    if (fetchedPosts && Array.isArray(fetchedPosts)) {
      posts = transformPostData(fetchedPosts);
      console.log('Transformed posts:', posts.length);
    } else {
      console.error('Invalid posts data received:', fetchedPosts);
      posts = [];
    }
  } catch (error) {
    console.error('Error loading posts:', error);
    posts = [];
  }

  return (
    <AdminCommunityForum
      posts={posts}
      loading={loading}
      onDeletePost={deletePostAction}
      onDeleteReply={deleteReplyAction}
    />
  );
}