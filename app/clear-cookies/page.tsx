// app/clear-cookies/page.tsx
'use client';

import { useEffect } from 'react';

export default function ClearCookiesPage() {
  useEffect(() => {
    console.log('🧹 CLEAR COOKIES - Manual cleanup');
    
    // Clear ALL client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear ALL cookies client-side
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
    });

    // Force redirect to login with cache busting
    const timestamp = Date.now();
    const random = Math.random();
    setTimeout(() => {
      window.location.href = `/auth/login?cleared=true&t=${timestamp}&r=${random}&nocache=1`;
    }, 1000);
    
  }, []);

  return (
    <div className="min-h-screen bg-blue-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-3xl mb-4">🧹 Clearing Cookies</h1>
        <p>Removing all authentication data...</p>
        <p className="text-blue-200 mt-4">Redirecting to login page</p>
      </div>
    </div>
  );
}