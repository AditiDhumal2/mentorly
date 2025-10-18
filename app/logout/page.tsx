'use client';

import { useEffect } from 'react';
import { logout } from './actions';

export default function LogoutPage() {
  useEffect(() => {
    console.log('🚪 LOGOUT PAGE - Starting auto logout');
    
    // Auto-execute logout when component mounts
    const performLogout = async () => {
      await logout();
    };
    
    performLogout();
  }, []);

  const handleManualLogout = async () => {
    console.log('🔄 LOGOUT PAGE - Manual logout triggered');
    await logout();
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600">Please wait while we securely log you out.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        
        {/* Manual logout button */}
        <button 
          onClick={handleManualLogout}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Click here if not redirected
        </button>
      </div>
    </div>
  );
}