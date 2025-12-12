// app/mentors/components/LogoutButton.tsx
'use client';

import { useState } from 'react';
import { mentorLogout } from '@/app/mentors-auth/login/actions/mentor-login.actions';

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await mentorLogout();
      // 🎯 Use window.location for immediate redirect
      window.location.href = '/mentors-auth/login?logout=success';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/mentors-auth/login?logout=error';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
    >
      {isLoading ? 'Logging out...' : 'Logout'}
    </button>
  );
}