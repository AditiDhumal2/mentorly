import { getCurrentUser } from '@/actions/userActions';
import ModeratorCommunityForum from '@/components/ModeratorCommunityForum';
import { redirect } from 'next/navigation';

export default async function StudentModeratorPage() {
  const currentUser = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/students-auth/login');
  }

  return <ModeratorCommunityForum currentUser={currentUser} />;
}