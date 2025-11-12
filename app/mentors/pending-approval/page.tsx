// app/mentors/pending-approval/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { checkMentorAuth } from '@/app/mentors-auth/login/actions/mentor-login.actions';

export default function PendingApprovalPage() {
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState('');

  const checkStatus = async () => {
    try {
      console.log('🔄 Checking mentor approval status...');

      const authResult = await checkMentorAuth();
      
      if (!authResult.isAuthenticated || !authResult.mentor) {
        console.log('❌ Not authenticated, redirecting to login');
        window.location.href = '/mentors-auth/login';
        return;
      }

      const mentor = authResult.mentor;
      console.log('📊 Current mentor status:', {
        profileCompleted: mentor.profileCompleted,
        approvalStatus: mentor.approvalStatus
      });

      // If already approved, redirect to dashboard
      if (mentor.approvalStatus === 'approved') {
        console.log('✅ Already approved, redirecting to dashboard');
        window.location.href = '/mentors/dashboard';
        return;
      }
      
      // If profile not completed, redirect to complete profile
      if (!mentor.profileCompleted) {
        console.log('📝 Profile not completed, redirecting to complete profile');
        window.location.href = '/mentors/complete-profile';
        return;
      }
      
      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);
      
    } catch (error) {
      console.error('❌ Error checking status:', error);
      setLastChecked(new Date().toLocaleTimeString());
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus(); // Check status on first load

    // Auto-refresh status every 3 seconds
    const interval = setInterval(() => {
      checkStatus();
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Checking your approval status...</p>
          <p className="text-gray-400 text-sm mt-2">Auto-refreshing every 3 seconds</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/10 p-8 text-center">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Awaiting Approval
          </h1>
          
          <p className="text-gray-300 mb-6">
            Your profile has been submitted for review. Our admin team will review your application and you will be notified via email once approved.
          </p>
          
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center text-blue-300 text-sm">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <div>You will be automatically redirected once approved.</div>
                <div className="text-blue-400 text-xs mt-1">Auto-refreshing every 3 seconds</div>
                {lastChecked && (
                  <div className="text-blue-400 text-xs mt-1">Last checked: {lastChecked}</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="text-sm text-gray-400 mb-4">
            <p>Contact support if you have any questions.</p>
          </div>

          <button
            onClick={() => {
              setLoading(true);
              checkStatus();
            }}
            className="w-full px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
          >
            Refresh Status Now
          </button>
        </div>
      </div>
    </div>
  );
}