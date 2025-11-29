// app/mentors-auth/login/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { checkMentorAuth } from './actions/mentor-login.actions';
import MentorLoginForm from './components/MentorLoginForm';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MentorLoginPage() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('🔄 Checking if mentor is already authenticated...');
        const authResult = await checkMentorAuth();
        
        console.log('🔍 Auth result:', authResult);
        
        // 🆕 FIXED: PROPER CHECK FOR AUTHENTICATION
        if (authResult?.isAuthenticated && authResult.mentor) {
          console.log('✅ Mentor already authenticated, redirecting...');
          console.log('👤 Mentor data:', {
            name: authResult.mentor.name,
            profileCompleted: authResult.mentor.profileCompleted,
            approvalStatus: authResult.mentor.approvalStatus
          });
          
          // 🆕 FIXED: Use router.push instead of window.location for better UX
          if (!authResult.mentor.profileCompleted) {
            router.push('/mentors/complete-profile');
          } else if (authResult.mentor.approvalStatus !== 'approved') {
            router.push('/mentors/pending-approval');
          } else {
            router.push('/mentors/dashboard');
          }
          return;
        } else {
          console.log('❌ No valid mentor session found');
        }
      } catch (error) {
        console.error('❌ Error checking auth:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, [router]);

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Navigation */}
      <nav className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-white">
                Mentor<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">ly</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/mentors-auth/register"
                className="text-gray-300 hover:text-white transition-colors"
              >
                Become a Mentor
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Centered */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              Mentor <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Login</span>
            </h1>
            <p className="text-xl text-gray-300">
              Access your mentor dashboard
            </p>
          </div>

          {/* Login Form */}
          <MentorLoginForm />

          {/* Additional Links */}
          <div className="text-center mt-8">
            <p className="text-gray-400">
              New to Mentorly?{' '}
              <Link
                href="/mentors-auth/register"
                className="text-purple-400 hover:text-purple-300 font-medium underline"
              >
                Apply to become a mentor
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}