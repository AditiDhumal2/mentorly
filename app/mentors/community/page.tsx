import { getMentorCommunityPosts } from '@/actions/communityforum-mentor-actions';
import { CommunityPost } from '@/types/community';
import MentorCommunityForum from './components/MentorCommunityForum';

// Helper function to ensure all required fields are present
function ensureCommunityPostFields(posts: any[]): CommunityPost[] {
  return posts.map(post => ({
    ...post,
    // Ensure all required fields have default values
    questionStatus: post.questionStatus || 'pending',
    priority: post.priority || 'medium',
    tags: post.tags || [],
    targetedMentorId: post.targetedMentorId || undefined,
    targetedMentorName: post.targetedMentorName || undefined
  }));
}

export default async function MentorCommunityForumPage() {
  let posts: CommunityPost[] = [];
  try {
    const fetchedPosts = await getMentorCommunityPosts();
    posts = ensureCommunityPostFields(fetchedPosts);
    console.log('✅ Loaded mentor posts:', posts.length);
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return <MentorCommunityForum initialPosts={posts} />;
}