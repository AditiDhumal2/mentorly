'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function HistoryManager() {
  const pathname = usePathname();

  useEffect(() => {
    console.log('🔒 HISTORY MANAGER - Setting up history protection');

    // Clean the URL
    if (window.location.search) {
      const cleanUrl = pathname;
      window.history.replaceState(null, '', cleanUrl);
    }

    // Block back navigation
    const handleBackButton = () => {
      console.log('🛑 HISTORY MANAGER - Back button blocked');
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handleBackButton);
    window.history.pushState(null, '', window.location.href);

    return () => {
      window.removeEventListener('popstate', handleBackButton);
    };
  }, [pathname]);

  return null;
}