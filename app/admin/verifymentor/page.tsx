// app/admin/verifymentor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getPendingMentors, approveMentor, rejectMentor, getMentorStats } from '@/actions/admin-mentor.actions';
import { MentorApplication } from '@/actions/admin-mentor.actions';
import MentorApplicationCard from './components/MentorApplicationCard';
import StatsOverview from './components/StatsOverview';

export default function VerifyMentorPage() {
  const [mentors, setMentors] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mentorsResult, statsResult] = await Promise.all([
        getPendingMentors(),
        getMentorStats()
      ]);

      if (!mentorsResult.success) {
        setError(mentorsResult.error || 'Failed to load mentors');
      } else {
        setMentors(mentorsResult.mentors || []);
      }

      if (statsResult.success) {
        setStats(statsResult.stats);
      } else {
        setError(statsResult.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (mentorId: string) => {
    setError('');
    setSuccess('');
    
    // In a real app, you'd get admin ID from session
    const adminId = 'admin-user-id';
    
    const result = await approveMentor(mentorId, adminId);
    
    if (!result.success) {
      setError(result.error || 'Failed to approve mentor');
    } else {
      setSuccess(result.message || 'Mentor approved successfully');
      // Remove the approved mentor from the list
      setMentors(mentors.filter(m => m._id !== mentorId));
      // Reload stats
      const statsResult = await getMentorStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    }
  };

  const handleReject = async (mentorId: string, reason: string) => {
    setError('');
    setSuccess('');
    
    // In a real app, you'd get admin ID from session
    const adminId = 'admin-user-id';
    
    const result = await rejectMentor(mentorId, adminId, reason);
    
    if (!result.success) {
      setError(result.error || 'Failed to reject mentor');
    } else {
      setSuccess(result.message || 'Mentor rejected successfully');
      // Remove the rejected mentor from the list
      setMentors(mentors.filter(m => m._id !== mentorId));
      // Reload stats
      const statsResult = await getMentorStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    }
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading mentor applications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mentor Verification</h1>
          <p className="text-gray-600 mt-2">
            Review and approve mentor applications to maintain platform quality
          </p>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button onClick={clearMessages} className="text-red-400 hover:text-red-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded mb-6">
            <div className="flex justify-between items-center">
              <span>{success}</span>
              <button onClick={clearMessages} className="text-green-400 hover:text-green-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Stats Overview */}
        {stats && <StatsOverview stats={stats} />}

        {/* Applications Section */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">
                Pending Applications ({mentors.length})
              </h2>
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          {mentors.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending applications</h3>
              <p className="mt-1 text-sm text-gray-500">
                All mentor applications have been reviewed and processed.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {mentors.map((mentor) => (
                <div key={mentor._id} className="p-6">
                  <MentorApplicationCard
                    mentor={mentor}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {mentors.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => {
                  // Approve all (with confirmation)
                  if (confirm(`Are you sure you want to approve all ${mentors.length} pending applications?`)) {
                    mentors.forEach(mentor => handleApprove(mentor._id));
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Approve All ({mentors.length})
              </button>
              
              <button
                onClick={() => {
                  // Reject all with a common reason
                  const reason = prompt('Enter reason for rejecting all applications:');
                  if (reason) {
                    mentors.forEach(mentor => handleReject(mentor._id, reason));
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Reject All ({mentors.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 