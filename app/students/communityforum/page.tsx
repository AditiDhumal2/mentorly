// app/students/communityforum/page.tsx
import { getCommunityPosts } from '@/actions/communityforum-students-actions';
import { CommunityPost } from '@/types/community';
import StudentCommunityForum from './StudentCommunityForum';

export default async function StudentCommunityForumPage() {
  let posts: CommunityPost[] = [];
  try {
    const rawPosts = await getCommunityPosts();
    
    // Transform posts to ensure userRole is set
    posts = rawPosts.map(post => ({
      ...post,
      userRole: post.userRole || 'student', // Ensure userRole exists
      replies: (post.replies || []).map((reply: any) => ({
        ...reply,
        userRole: reply.userRole || 'student' // Ensure reply userRole exists
      }))
    }));
    
    console.log('✅ Loaded posts with roles:', posts.length);
    
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return <StudentCommunityForum initialPosts={posts} />;
}