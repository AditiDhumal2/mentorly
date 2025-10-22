'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AdminLoginForm } from './AdminLoginForm';

export default function AdminLoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Clear any cached credentials and prevent caching
    const clearAuthData = () => {
      localStorage.removeItem('admin-auth');
      sessionStorage.removeItem('admin-auth');
      // Clear form cache
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('login-form');
      }
    };

    clearAuthData();

    // Check if this is a logout redirect
    const logout = searchParams.get('logout');
    if (logout === 'success') {
      console.log('✅ User logged out successfully');
      clearAuthData();
      
      // Clear browser history and prevent back navigation
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', '/admin-login?logout=success&t=' + Date.now());
      }
    }

    // Force clear browser cache for this page
    const clearBrowserCache = () => {
      // Disable browser caching
      if ('caches' in window) {
        caches.keys().then(names => {
          names.forEach(name => {
            caches.delete(name);
          });
        });
      }
    };

    clearBrowserCache();

    // Prevent any caching of this page
    if (window.history && window.history.replaceState) {
      const cleanUrl = window.location.origin + window.location.pathname + '?t=' + Date.now();
      window.history.replaceState(null, '', cleanUrl);
    }
  }, [searchParams]);

  // Enhanced back button prevention
  useEffect(() => {
    if (!isMounted) return;

    const handlePopState = (event: PopStateEvent) => {
      console.log('🔙 Browser back button pressed');
      
      // Check if user is authenticated by checking cookies
      const hasAuthCookie = document.cookie.includes('user-data');
      
      if (hasAuthCookie) {
        // If authenticated and trying to go back to login, prevent it and redirect to admin
        console.log('🚫 Blocking back navigation to login - user is authenticated');
        
        // Push current state again to prevent back
        window.history.pushState(null, '', window.location.href);
        
        // Redirect to admin dashboard
        router.push('/admin?t=' + Date.now());
      } else {
        // If not authenticated, allow normal navigation but prevent caching
        console.log('✅ Allowing back navigation - user not authenticated');
        window.history.replaceState(null, '', window.location.href + '&t=' + Date.now());
      }
    };

    // Add event listener
    window.addEventListener('popstate', handlePopState);
    
    // Push a new state to the history to prevent direct back navigation
    window.history.pushState(null, '', window.location.href);

    // Prevent forward navigation as well
    const handleBeforeUnload = () => {
      // Clear any sensitive data if needed
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // Cleanup function
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isMounted, router]);

  // Additional protection: Check authentication status on page load
  useEffect(() => {
    if (!isMounted) return;

    const checkAuthAndRedirect = async () => {
      const hasAuthCookie = document.cookie.includes('user-data');
      
      if (hasAuthCookie) {
        console.log('🔄 User already authenticated, redirecting to admin dashboard');
        
        // Add delay to ensure proper redirect
        setTimeout(() => {
          router.push('/admin?t=' + Date.now());
        }, 100);
      }
    };

    checkAuthAndRedirect();
  }, [router, isMounted]);

  // Add no-cache meta tags dynamically
  useEffect(() => {
    // Remove any existing meta tags
    const existingMeta = document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]');
    existingMeta.forEach(meta => meta.remove());

    // Add no-cache meta tags
    const metaTags = [
      { 'http-equiv': 'Cache-Control', content: 'no-store, no-cache, must-revalidate, max-age=0' },
      { 'http-equiv': 'Pragma', content: 'no-cache' },
      { 'http-equiv': 'Expires', content: '0' }
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      meta.httpEquiv = Object.keys(tag)[0];
      meta.content = tag.content;
      document.head.appendChild(meta);
    });

    return () => {
      // Cleanup meta tags on unmount
      const metaTags = document.querySelectorAll('meta[http-equiv="Cache-Control"], meta[http-equiv="Pragma"], meta[http-equiv="Expires"]');
      metaTags.forEach(meta => meta.remove());
    };
  }, []);

  if (!isMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading Security Portal...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

      <div className="relative w-full max-w-md mx-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/30 transform rotate-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-30"></div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-3">
            Admin Portal
          </h1>
          <p className="text-gray-300 text-lg mb-2">
            Secure System Access
          </p>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="text-sm text-gray-300 font-medium">Restricted Access • No Cache</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl shadow-black/30 overflow-hidden">
          {/* Form Header */}
          <div className="px-8 pt-8 pb-6 border-b border-white/10">
            <h2 className="text-2xl font-bold text-white mb-2">Administrator Login</h2>
            <p className="text-gray-300 text-sm">
              Enter your credentials to access the management system
            </p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6">
            <AdminLoginForm />
          </div>

          {/* Security Footer */}
          <div className="px-8 py-4 bg-black/20 border-t border-white/10">
            <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Session protected • Back navigation disabled • No caching</span>
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            For authorized personnel only • Unauthorized access prohibited
          </p>
        </div>
      </div>
    </div>
  );
}