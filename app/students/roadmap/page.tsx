// app/students/roadmap/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getCurrentUser } from '@/actions/userActions';
import { 
  getRoadmapAction, 
  getRoadmapProgressAction,
  getAvailableLanguagesAction 
} from '@/actions/student-roadmap'; 
import { languages, getLanguageById } from '@/lib/languages';
import RoadmapClient from './components/roadmap-client';

// Define a type for student user with year property
interface StudentUser {
  _id: any;
  id: any;
  name: any;
  email: any;
  role: 'student';
  year?: number; // Make year optional
  college?: any;
  profilePhoto?: any;
  profiles?: any;
  bio?: any;
  createdAt: any;
  updatedAt: any;
}

export default async function StudentRoadmapPage() {
  console.log('📍 /students/roadmap - Loading student roadmap...');
  
  const user = await getCurrentUser();
  
  console.log('🔍 StudentRoadmapPage - User session:', user);
  
  if (!user) {
    console.log('❌ No student session found for /students/roadmap');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Student Login Required</h1>
          <p className="text-gray-600 mb-6">Please log in with your student account to access the roadmap</p>
          <a href="/students-auth/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Student Login
          </a>
        </div>
      </div>
    );
  }

  // Verify it's actually a student and type assertion
  if (user.role !== 'student') {
    console.log('❌ User is not a student:', user.role);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Restricted</h1>
          <p className="text-gray-600 mb-6">This page is only accessible to students.</p>
          <a href="/dashboard" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Type assertion for student user
  const studentUser = user as StudentUser;
  const userYear = studentUser.year || 1;

  console.log('✅ Student authenticated for roadmap:', studentUser.name, 'Year:', userYear);

  try {
    // Get available languages to determine preferred language
    const languagesResult = await getAvailableLanguagesAction();
    const preferredLanguage = languagesResult.success && languagesResult.data && languagesResult.data.length > 0
      ? languagesResult.data[0] // Use first available language
      : 'python';

    console.log('📚 Loading roadmap for year:', userYear, 'language:', preferredLanguage);

    const [roadmapResult, progressResult] = await Promise.all([
      getRoadmapAction(userYear, preferredLanguage),
      getRoadmapProgressAction(studentUser._id, preferredLanguage, userYear)
    ]);

    // Handle roadmap loading errors
    if (!roadmapResult.success || !roadmapResult.data) {
      console.log('❌ Roadmap loading failed:', roadmapResult.error);
      return (
        <div className="max-w-7xl mx-auto p-6">
          <div className="text-center bg-red-50 rounded-2xl p-8 border border-red-200 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Roadmap Unavailable</h1>
            <p className="text-gray-600 mb-2">
              {roadmapResult.error || 'We couldn\'t load your roadmap'}
            </p>
            <p className="text-gray-500 text-sm">Please try refreshing the page or contact support</p>
          </div>
        </div>
      );
    }

    // Handle progress loading errors
    if (!progressResult.success) {
      console.log('⚠️ Progress loading issue:', progressResult.error);
      // Continue with empty progress instead of showing error
    }

    const userLanguage = getLanguageById(preferredLanguage) || languages[0];

    console.log('✅ Roadmap loaded successfully');

    return (
      <RoadmapClient 
        roadmap={roadmapResult.data} 
        progress={progressResult.data?.progress || []}
        currentYear={userYear}
        userId={studentUser._id}
        languages={languages}
        userLanguage={userLanguage}
        preferredLanguage={preferredLanguage}
        studentCurrentYear={userYear}
      />
    );
  } catch (error) {
    console.error('❌ Error loading roadmap page:', error);
    
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center bg-red-50 rounded-2xl p-8 border border-red-200 max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m-6 0l3-3m-3 3V4m0 16a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Unexpected Error</h1>
          <p className="text-gray-600 mb-2">Something went wrong while loading your roadmap</p>
          <p className="text-gray-500 text-sm">Please try refreshing the page</p>
          <a 
            href="/students/roadmap"
            className="mt-4 inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </a>
        </div>
      </div>
    );
  }
}