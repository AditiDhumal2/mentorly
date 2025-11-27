// app/mentors/dashboard/components/UpcomingSessions.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Session } from '@/types';

interface UpcomingSessionsProps {
  sessions: Session[];
}

export default function UpcomingSessions({ sessions }: UpcomingSessionsProps) {
  const router = useRouter();

  const handleJoinSession = (session: Session) => {
    if (session.meetingLink) {
      window.open(session.meetingLink, '_blank');
    } else {
      alert('Meeting link will be available 15 minutes before the session');
    }
  };

  const handleRescheduleSession = (sessionId: string) => {
    router.push(`/mentors/sessions/${sessionId}/reschedule`);
  };

  const getSessionTypeColor = (type: string) => {
    const colors = {
      technical: 'bg-blue-100 text-blue-800',
      'higher-education': 'bg-green-100 text-green-800',
      'career-guidance': 'bg-purple-100 text-purple-800',
      'placement-prep': 'bg-orange-100 text-orange-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatSessionDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (date.toDateString() === today.toDateString()) return 'Today';
      if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
      
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    } catch (error) {
      return dateString;
    }
  };

  const formatSessionTime = (timeString: string, duration: number): string => {
    try {
      const startTime = new Date(`2000-01-01T${timeString}`);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      const formatTime = (date: Date) => 
        date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
      
      return `${formatTime(startTime)} - ${formatTime(endTime)}`;
    } catch (error) {
      return timeString;
    }
  };

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
          <Link href="/mentors/sessions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No upcoming sessions</div>
          <p className="text-gray-500 text-sm mb-4">Your upcoming sessions will appear here</p>
          <Link 
            href="/mentors/availability" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Set Availability
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Upcoming Sessions</h2>
        <Link href="/mentors/sessions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors duration-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{session.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{session.student.name}</p>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatSessionDate(session.date)}
                  </span>
                  <span className="flex items-center text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formatSessionTime(session.time, session.duration)}
                  </span>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${getSessionTypeColor(session.type)}`}>
                {session.type}
              </span>
            </div>
            <div className="flex space-x-2 mt-3">
              <button 
                onClick={() => handleJoinSession(session)}
                className="flex-1 bg-blue-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!session.meetingLink}
              >
                {session.meetingLink ? 'Join Session' : 'Link Coming Soon'}
              </button>
              <button 
                onClick={() => handleRescheduleSession(session.id)}
                className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reschedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}