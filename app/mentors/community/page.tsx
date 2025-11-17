import { getMentorCommunityPosts } from '@/actions/communityforum-mentor-actions';
import { getPostsByCategory } from '@/actions/community-categories-actions';
import { getCurrentMentorSession, getCurrentUser } from '@/actions/userActions';
import MentorCommunityForum from './components/MentorCommunityForum';
import CategoryHomepage from '@/components/CategoryHomepage';
import { CommunityPost } from '@/types/community';

interface MentorCommunityForumPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MentorCommunityForumPage({ 
  searchParams 
}: MentorCommunityForumPageProps) {
  // Await the searchParams promise
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string;
  
  try {
    // Get the actual authenticated user
    const currentUser = await getCurrentUser();
    const mentorSession = await getCurrentMentorSession();
    
    const userRole = mentorSession.isLoggedIn ? 'mentor' : null;
    const userName = currentUser?.name || mentorSession.mentor?.name || 'Mentor User';

    console.log('🔍 Mentor Community Page - User Info:', {
      currentUser: currentUser?.name,
      mentorSession: mentorSession.mentor?.name,
      userRole,
      userName
    });

    // If no category specified, show category homepage
    if (!category) {
      return <CategoryHomepage userRole={userRole} userName={userName} userType="mentor" />;
    }

    let posts: CommunityPost[] = [];
    
    if (category) {
      // Get posts filtered by category
      posts = await getPostsByCategory(category, userRole);
    } else {
      // Get all posts (existing behavior)
      const rawPosts = await getMentorCommunityPosts();
      posts = transformPosts(rawPosts);
    }
    
    console.log('✅ Loaded mentor posts:', posts.length, 'Category:', category);
    console.log('👤 Current User:', currentUser?.name);
    
    // Pass the actual currentUser to the component
    return <MentorCommunityForum 
      initialPosts={posts} 
      currentCategory={category} 
      currentUser={currentUser} // Pass the real user
    />;
    
  } catch (error) {
    console.error('Error loading posts:', error);
    return <MentorCommunityForum initialPosts={[]} currentCategory={category} />;
  }
}

// Helper function to transform and filter posts
function transformPosts(posts: any[]): CommunityPost[] {
  return posts
    .filter(post => {
      const validCategories: CommunityPost['category'][] = [
        'higher-education', 'market-trends', 'domains', 'placements',
        'general', 'academic', 'career', 'technical', 'mentor-question'
      ];
      return validCategories.includes(post.category);
    })
    .map(post => ({
      ...post,
      category: post.category as CommunityPost['category']
    }));
}