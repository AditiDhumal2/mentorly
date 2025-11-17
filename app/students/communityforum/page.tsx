import { getPostsByCategory } from '@/actions/community-categories-actions';
import { getCurrentStudentSession, getCurrentUser } from '@/actions/userActions';
import StudentCommunityForum from './components/StudentCommunityForum';
import CategoryHomepage from '@/components/CategoryHomepage';
import { CommunityPost } from '@/types/community';

interface StudentCommunityForumPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StudentCommunityForumPage({ 
  searchParams 
}: StudentCommunityForumPageProps) {
  // Await the searchParams promise
  const resolvedSearchParams = await searchParams;
  const category = resolvedSearchParams.category as string;
  
  try {
    // Get the actual authenticated user
    const currentUser = await getCurrentUser();
    const studentSession = await getCurrentStudentSession();
    
    const userRole = studentSession.isLoggedIn ? 'student' : null;
    const userName = currentUser?.name || studentSession.student?.name || null;

    console.log('🔍 Student Community Page - User Info:', {
      currentUser: currentUser?.name,
      studentSession: studentSession.student?.name,
      userRole,
      userName
    });

    // If no category specified, show category homepage
    if (!category) {
      return <CategoryHomepage userRole={userRole} userName={userName} userType="student" />;
    }

    let posts: CommunityPost[] = [];
    
    if (category) {
      // Use the SAME function as mentors - getPostsByCategory
      posts = await getPostsByCategory(category, userRole);
    }
    
    console.log('🎯 Student category page - Category:', category);
    console.log('✅ Loaded student posts:', posts.length);
    console.log('📢 Announcements in category:', posts.filter(post => post.category === 'announcement').length);
    console.log('👤 Current User:', currentUser?.name);
    
    // Pass the actual currentUser to the component
    return <StudentCommunityForum 
      initialPosts={posts} 
      currentCategory={category} 
      currentUser={currentUser} // Pass the real user
    />;
    
  } catch (error) {
    console.error('❌ Error loading posts:', error);
    // Return empty state on error
    return <StudentCommunityForum initialPosts={[]} currentCategory={category} />;
  }
}