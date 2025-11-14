import { getStudentCommunityPosts } from '@/actions/communityforum-students-actions';
import { CommunityPost } from '@/types/community';
import StudentCommunityForum from './components/StudentCommunityForum';

// Helper function to transform and filter posts
function transformPosts(posts: any[]): CommunityPost[] {
  return posts
    .filter(post => {
      const validCategories: CommunityPost['category'][] = ['general', 'academic', 'career', 'technical', 'announcement', 'mentor-question'];
      return validCategories.includes(post.category);
    })
    .map(post => ({
      ...post,
      category: post.category as CommunityPost['category']
    }));
}

export default async function StudentCommunityForumPage() {
  let posts: CommunityPost[] = [];
  try {
    const rawPosts = await getStudentCommunityPosts();
    posts = transformPosts(rawPosts);
    
    console.log('✅ Loaded student posts:', posts.length);
    
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return <StudentCommunityForum initialPosts={posts} />;
}