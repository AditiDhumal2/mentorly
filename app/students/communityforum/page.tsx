import { getCommunityPosts } from '@/actions/communityforum-students-actions';
import { CommunityPost } from '@/types/community';
import StudentCommunityForum from './StudentCommunityForum';

export default async function StudentCommunityForumPage() {
  // Fetch posts on the server - they are already converted to plain objects
  let posts: CommunityPost[] = [];
  try {
    posts = await getCommunityPosts();
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return <StudentCommunityForum initialPosts={posts} />;
}