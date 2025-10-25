'use client';

import { useState } from 'react';
import { adminLogout } from '@/actions/adminAuthActions';

interface AdminLogoutProps {
  className?: string;
  variant?: 'default' | 'minimal';
}

export default function AdminLogout({ className = '', variant = 'default' }: AdminLogoutProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await adminLogout();
      
      if (result.success) {
        // Clear client-side storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear cookies client-side as backup
          document.cookie = 'admin-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        
        // Use the redirect URL from server or fallback
        const redirectUrl = result.redirectUrl || '/admin-login?logout=success';
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback redirect
      window.location.href = '/admin-login?logout=success&fallback=true';
    }
  };

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoggingOut}
        className={`flex items-center space-x-2 text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}