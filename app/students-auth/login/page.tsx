'use client';

import { useSearchParams } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const [shouldRender, setShouldRender] = useState(false);

  const logoutMessage = searchParams.get('logout');
  const errorMessage = searchParams.get('error');

  useEffect(() => {
    // MULTI-LAYER PROTECTION: Check auth in multiple ways
    const checkAndRedirect = () => {
      try {
        // Method 1: Check cookies directly
        const cookies = document.cookie.split(';');
        const userDataCookie = cookies.find(cookie => 
          cookie.trim().startsWith('user-data=')
        );
        
        if (userDataCookie) {
          const cookieValue = userDataCookie.split('=')[1];
          if (cookieValue && cookieValue !== '') {
            console.log('🔄 LOGIN PAGE REDIRECT: User logged in, redirecting to /students');
            
            // Use replace to avoid adding to browser history
            window.location.replace('/students');
            return true;
          }
        }

        // Method 2: Check localStorage/sessionStorage for auth flags
        if (localStorage.getItem('user-authenticated') || sessionStorage.getItem('user-authenticated')) {
          console.log('🔄 STORAGE REDIRECT: Auth flag found, redirecting');
          window.location.replace('/students');
          return true;
        }

        return false;
      } catch (error) {
        console.error('Login page redirect error:', error);
        return false;
      }
    };

    // Run immediate check
    const shouldRedirect = checkAndRedirect();
    
    if (!shouldRedirect) {
      // Only show login form if user is definitely not logged in
      const timer = setTimeout(() => {
        setShouldRender(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render anything until we're sure user needs to login
  if (!shouldRender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-cyan-200 text-sm">Checking your session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your student account</p>
        </div>

        {/* Messages */}
        {logoutMessage === 'success' && (
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4">
            <p className="text-green-300 text-center">✅ Successfully logged out</p>
          </div>
        )}
        
        {errorMessage === 'unauthorized' && (
          <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
            <p className="text-yellow-300 text-center">🔒 Please log in to access this page</p>
          </div>
        )}
        
        <LoginForm />
        
        {/* Security Notice */}
        <div className="text-center">
          <p className="text-sm text-gray-400">
            🔒 Secure authentication required
          </p>
        </div>
      </div>
    </div>
  );
}