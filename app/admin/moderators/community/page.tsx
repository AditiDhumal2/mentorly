import { getCurrentUser } from '@/actions/userActions';
import { getModeratorByUserId, getModeratorPosts } from '@/actions/moderator-actions';
import ModeratorCommunityForum from './components/ModeratorCommunityForum';
import { redirect } from 'next/navigation';

export default async function ModeratorCommunityPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/login');
  }

  const moderator = await getModeratorByUserId(currentUser._id);
  
  if (!moderator) {
    redirect('/unauthorized');
  }

  const posts = await getModeratorPosts(currentUser._id);

  return (
    <ModeratorCommunityForum 
      initialPosts={posts} 
      currentUser={currentUser}
      moderator={moderator}
    />
  );
}