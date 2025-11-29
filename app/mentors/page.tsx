// app/mentors/page.tsx
import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';

export default async function MentorsPage() {
  // Check if user is authenticated as mentor
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  // Redirect to dashboard
  redirect('/mentors/dashboard');
}