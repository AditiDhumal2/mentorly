// app/admin/communityforum/page.tsx
import { getAdminCommunityPosts } from '@/actions/communityforum-admin-actions';
import { getPostsByCategory } from '@/actions/community-categories-actions';
import AdminCommunityForum from './components/AdminCommunityForum';
import CategoryHomepage from '@/components/CategoryHomepage';
import { CommunityPost } from '@/types/community'; // Updated import

interface AdminCommunityForumPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminCommunityForumPage({ 
  searchParams 
}: AdminCommunityForumPageProps) {
  // Await the searchParams promise
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string;
  
  const userRole = 'admin' as const;
  const userName = 'Admin User';

  // If no category specified, show category homepage
  if (!category) {
    return <CategoryHomepage userRole={userRole} userName={userName} userType="admin" />;
  }

  let posts: CommunityPost[] = [];
  
  try {
    if (category) {
      // Get posts filtered by category
      posts = await getPostsByCategory(category, userRole);
    } else {
      // Get all posts (existing behavior)
      const rawPosts = await getAdminCommunityPosts();
      posts = transformPostData(rawPosts);
    }
    
    console.log('✅ Loaded admin posts:', posts.length, 'Category:', category);
    
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return <AdminCommunityForum posts={posts} loading={false} currentCategory={category} />;
}

// Helper function to safely transform the data
function transformPostData(posts: any[]): CommunityPost[] {
  return posts.map(post => {
    const createdAt = post.createdAt instanceof Date 
      ? post.createdAt.toISOString() 
      : typeof post.createdAt === 'string' 
        ? post.createdAt 
        : new Date().toISOString();

    const updatedAt = post.updatedAt instanceof Date 
      ? post.updatedAt.toISOString() 
      : typeof post.updatedAt === 'string' 
        ? post.updatedAt 
        : createdAt;

    const deletedAt = post.deletedAt instanceof Date 
      ? post.deletedAt.toISOString() 
      : typeof post.deletedAt === 'string' 
        ? post.deletedAt 
        : undefined;

    const editedAt = post.editedAt instanceof Date 
      ? post.editedAt.toISOString() 
      : typeof post.editedAt === 'string' 
        ? post.editedAt 
        : undefined;

    const transformedReplies = (post.replies || []).map((reply: any) => {
      const replyCreatedAt = reply.createdAt instanceof Date 
        ? reply.createdAt.toISOString() 
        : typeof reply.createdAt === 'string' 
          ? reply.createdAt 
          : new Date().toISOString();

      const replyUpdatedAt = reply.updatedAt instanceof Date 
        ? reply.updatedAt.toISOString() 
        : typeof reply.updatedAt === 'string' 
          ? reply.updatedAt 
          : replyCreatedAt;

      return {
        _id: reply._id?.toString() || '',
        userId: reply.userId?.toString() || '',
        userName: reply.userName || 'Unknown User',
        userRole: reply.userRole || 'student',
        message: reply.message || reply.content || '',
        createdAt: replyCreatedAt,
        updatedAt: replyUpdatedAt,
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
      visibility: post.visibility || 'public',
      replies: transformedReplies,
      upvotes: (post.upvotes || []).map((upvote: any) => upvote.toString()),
      isDeleted: post.isDeleted || false,
      reportCount: post.reportCount || 0,
      deletedBy: post.deletedBy?.toString(),
      deletedAt: deletedAt,
      createdAt: createdAt,
      updatedAt: updatedAt,
      edited: post.edited || false,
      editedAt: editedAt,
      editCount: post.editCount || 0,
      targetedMentorId: post.targetedMentorId?.toString(),
      targetedMentorName: post.targetedMentorName,
      questionStatus: post.questionStatus || 'pending',
      priority: post.priority || 'medium',
      tags: post.tags || []
    };
  });
}