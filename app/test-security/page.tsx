// app/test-security/page.tsx
'use client';

import { useEffect } from 'react';

export default function TestSecurityPage() {
  useEffect(() => {
    console.log('🔍 TEST: Checking if we can access /students directly...');
    
    setTimeout(() => {
      window.location.href = '/students?test=' + Date.now();
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-red-900 flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-3xl mb-4">🔒 Security Test</h1>
        <p>Attempting to access /students without login...</p>
        <p className="text-red-200 mt-4">You should be redirected to login page</p>
      </div>
    </div>
  );
}