import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { getModeratorByUserId, getModeratorPosts } from '@/actions/moderator-actions';
import { redirect } from 'next/navigation';
import ModeratorCommunityForum from '@/components/ModeratorCommunityForum';

export default async function MentorModeratorPage() {
  // Use the mentor-specific function
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    console.log('❌ No mentor user found, redirecting to login');
    redirect('/mentors-auth/login');
  }

  console.log('✅ Mentor user found:', currentUser.name, 'Role:', currentUser.role);

  // Server-side check for moderator status
  const moderator = await getModeratorByUserId(currentUser._id);
  
  if (!moderator) {
    console.log('❌ User is not a moderator');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md">
          <div className="text-gray-400 text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h3>
          <p className="text-gray-600 mb-6">
            You don't have moderator privileges for the mentor platform.
          </p>
          <a
            href="/mentors/dashboard"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Mentor Dashboard
          </a>
        </div>
      </div>
    );
  }

  console.log('✅ User is a moderator, fetching posts...');
  const posts = await getModeratorPosts(currentUser._id);

  // Pass all data from server to avoid client-side fetching
  return (
    <ModeratorCommunityForum 
      currentUser={currentUser}
      moderator={moderator}
      initialPosts={posts}
    />
  );
}