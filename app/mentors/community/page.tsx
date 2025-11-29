// app/mentors/community/page.tsx
import { getCurrentUserForMentorRoute } from '@/actions/userActions';
import { redirect } from 'next/navigation';
import { getMentorCommunityPosts } from '@/actions/communityforum-mentor-actions';
import { getPostsByCategory } from '@/actions/community-categories-actions';
import MentorCommunityForum from './components/MentorCommunityForum';
import CategoryHomepage from '@/components/CategoryHomepage';

interface MentorCommunityForumPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function MentorCommunityForumPage({ 
  searchParams 
}: MentorCommunityForumPageProps) {
  const currentUser = await getCurrentUserForMentorRoute();
  
  if (!currentUser) {
    redirect('/mentors-auth/login');
  }

  // Await the searchParams promise
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string;

  console.log('🔍 Mentor Community Page - User authenticated:', currentUser.name);

  // If no category specified, show category homepage
  if (!category) {
    return <CategoryHomepage userRole="mentor" userName={currentUser.name} userType="mentor" />;
  }

  let posts = [];
  
  try {
    if (category) {
      // Get posts filtered by category
      posts = await getPostsByCategory(category, 'mentor');
    } else {
      // Get all posts
      const rawPosts = await getMentorCommunityPosts();
      posts = transformPosts(rawPosts);
    }
    
    console.log('✅ Loaded mentor posts:', posts.length, 'Category:', category);
    
    return <MentorCommunityForum 
      initialPosts={posts} 
      currentCategory={category} 
      currentUser={currentUser}
    />;
    
  } catch (error) {
    console.error('Error loading posts:', error);
    return <MentorCommunityForum initialPosts={[]} currentCategory={category} currentUser={currentUser} />;
  }
}

// Helper function to transform and filter posts
function transformPosts(posts: any[]): any[] {
  return posts
    .filter(post => {
      const validCategories = [
        'higher-education', 'market-trends', 'domains', 'placements',
        'general', 'academic', 'career', 'technical', 'mentor-question'
      ];
      return validCategories.includes(post.category);
    })
    .map(post => ({
      ...post,
      category: post.category
    }));
}