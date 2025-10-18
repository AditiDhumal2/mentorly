// hooks/useAuthGuard.ts
'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function useAuthGuard() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Nuclear solution: Completely block back button functionality
    if (typeof window !== 'undefined') {
      console.log('🛡️ useAuthGuard - Setting up nuclear back button protection');

      // Replace current history entry to prevent back navigation
      const currentUrl = window.location.href;
      window.history.replaceState(null, '', currentUrl);
      
      // Add a new history entry
      window.history.pushState(null, '', currentUrl);

      const handlePopState = (event: PopStateEvent) => {
        console.log('🚫 useAuthGuard - Back button blocked!');
        
        // Immediately push the current state back
        window.history.pushState(null, '', currentUrl);
        
        // Optional: Show a message to user
        console.log('Navigation blocked. Please use the app navigation instead.');
      };

      // Add event listener
      window.addEventListener('popstate', handlePopState);

      // Clear any forward history
      window.history.go(1);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [pathname, searchParams]);
}