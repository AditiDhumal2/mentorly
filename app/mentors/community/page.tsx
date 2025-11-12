// app/mentors/community/page.tsx
import { getCommunityPosts } from '@/actions/communityforum-mentor-actions';
import { CommunityPost } from '@/types/community';
import MentorCommunityForum from './components/MentorCommunityForum';

export default async function MentorCommunityForumPage() {
  let posts: CommunityPost[] = [];
  try {
    posts = await getCommunityPosts();
  } catch (error) {
    console.error('Error loading posts:', error);
  }

  return <MentorCommunityForum initialPosts={posts} />;
}