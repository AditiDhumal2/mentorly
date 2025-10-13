// Add these lines to prevent caching issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { getCurrentUser } from '@/lib/session';
import { getRoadmapAction, getRoadmapProgressAction } from '@/actions/roadmap-actions';
import { languages, getLanguageById } from '@/lib/languages';
import RoadmapClient from './components/roadmap-client';

// Temporary function to replace missing import
async function getUserLanguagesAction(userId: string) {
  return {
    success: true,
    data: {
      preferredLanguage: 'python' // Default language
    }
  };
}

export default async function RoadmapPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please log in to view your personalized learning roadmap</p>
          <a href="/auth/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  try {
    const [languagesResult] = await Promise.all([
      getUserLanguagesAction(user.id)
    ]);

    const preferredLanguage = languagesResult.success && languagesResult.data 
      ? languagesResult.data.preferredLanguage 
      : 'python';

    const [roadmapResult, progressResult] = await Promise.all([
      getRoadmapAction(user.year, preferredLanguage),
      getRoadmapProgressAction(user.id)
    ]);

    // Handle roadmap loading errors
    if (!roadmapResult.success || !roadmapResult.data) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    if (!progressResult.success || !progressResult.data) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Progress Data Issue</h1>
            <p className="text-gray-600 mb-2">
              {progressResult.error || 'We couldn\'t load your progress data'}
            </p>
            <p className="text-gray-500 text-sm">Your progress tracking might be temporarily unavailable</p>
          </div>
        </div>
      );
    }

    const userLanguage = getLanguageById(preferredLanguage) || languages[0];

    // Data is already serialized by the server action, so we can pass it directly
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100">
        <RoadmapClient 
          roadmap={roadmapResult.data} 
          progress={progressResult.data.progress}
          currentYear={user.year}
          userId={user.id}
          languages={languages}
          userLanguage={userLanguage}
          preferredLanguage={preferredLanguage}
        />
      </div>
    );
  } catch (error) {
    console.error('Error loading roadmap page:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m-6 0l3-3m-3 3V4m0 16a8 8 0 100-16 8 8 0 000 16z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Unexpected Error</h1>
          <p className="text-gray-600 mb-2">Something went wrong while loading your roadmap</p>
          <p className="text-gray-500 text-sm">Please try refreshing the page</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }
}