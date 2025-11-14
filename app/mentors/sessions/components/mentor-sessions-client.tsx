'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SessionCard from './session-card';
import SessionActionModal from './session-action-modal';
import { MentorSession, SessionActionRequest } from '@/types/mentor-sessions';
import { updateSessionStatus, getMentorStats } from '@/actions/mentor-sessions-actions';
import { Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface MentorStats {
  totalSessions: number;
  pendingRequests: number;
  completedSessions: number;
  upcomingSessions: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface MentorSessionsClientProps {
  initialSessions: MentorSession[];
  initialStats: MentorStats | null;
  user: User;
}

export default function MentorSessionsClient({ 
  initialSessions, 
  initialStats, 
  user 
}: MentorSessionsClientProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<MentorSession[]>(initialSessions);
  const [stats, setStats] = useState<MentorStats | null>(initialStats);
  const [selectedSession, setSelectedSession] = useState<MentorSession | null>(null);
  const [selectedAction, setSelectedAction] = useState<string>('');
  const [showActionModal, setShowActionModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const handleSessionAction = (session: MentorSession, action: string) => {
    setSelectedSession(session);
    setSelectedAction(action);
    setShowActionModal(true);
  };

  const handleConfirmAction = async (actionData: any) => {
    if (!selectedSession) return;

    setIsLoading(true);
    try {
      const requestData: SessionActionRequest = {
        sessionId: selectedSession._id,
        action: selectedAction as any,
        ...actionData
      };

      const result = await updateSessionStatus(requestData);

      if (result.success && result.session) {
        // Update local state
        setSessions(prev => prev.map(session => 
          session._id === selectedSession._id ? result.session! : session
        ));
        
        // Refresh stats
        const statsResult = await getMentorStats(user._id);
        if (statsResult.success) {
          setStats(statsResult.stats);
        }

        setShowActionModal(false);
        setSelectedSession(null);
        setSelectedAction('');
      } else {
        alert(result.error || 'Failed to update session');
      }
    } catch (error: any) {
      console.error('Error updating session:', error);
      // If there's an authentication error, redirect to login
      if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
        router.push('/mentors-auth/login');
        return;
      }
      alert('Failed to update session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    return session.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Session Requests</h1>
          <p className="text-gray-600 mt-2">
            Manage your mentoring sessions and help students achieve their goals
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedSessions}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingSessions}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2">
            {['all', 'requested', 'accepted', 'scheduled', 'completed', 'cancelled', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} 
                {status !== 'all' && (
                  <span className="ml-1">
                    ({sessions.filter(s => s.status === status).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Sessions Grid */}
        {filteredSessions.length > 0 ? (
          <div className="space-y-6">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onAction={handleSessionAction}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📭</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === 'all' ? 'No sessions yet' : `No ${filter} sessions`}
            </h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'Student session requests will appear here once they start booking sessions with you.'
                : `You don't have any ${filter} sessions at the moment.`
              }
            </p>
          </div>
        )}

        {/* Action Modal */}
        <SessionActionModal
          session={selectedSession}
          action={selectedAction}
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          onConfirm={handleConfirmAction}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}