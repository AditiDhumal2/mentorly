'use client';

import { MentorSession } from '@/types/mentor-sessions';
import { Calendar, Clock, User, Mail, BookOpen, MapPin } from 'lucide-react';

interface SessionCardProps {
  session: MentorSession;
  onAction: (session: MentorSession, action: string) => void;
}

export default function SessionCard({ session, onAction }: SessionCardProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      requested: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      accepted: 'bg-blue-100 text-blue-800 border-blue-200',
      scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status as keyof typeof colors] || colors.requested;
  };

  const getStatusText = (status: string) => {
    const texts = {
      requested: 'Pending',
      accepted: 'Accepted',
      scheduled: 'Scheduled',
      completed: 'Completed',
      cancelled: 'Cancelled',
      rejected: 'Rejected'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-lg">{session.title}</h3>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(session.status)}`}>
                {getStatusText(session.status)}
              </span>
            </div>
            <p className="text-gray-600 text-sm">{session.description}</p>
          </div>
        </div>

        {/* Student Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {session.studentId.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{session.studentId.name}</h4>
              <p className="text-gray-600 text-sm flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                {session.studentId.email}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center text-gray-600">
              <BookOpen className="w-4 h-4 mr-2" />
              Year {session.studentId.year}
            </div>
            {session.studentId.college && (
              <div className="flex items-center text-gray-600">
                <MapPin className="w-4 h-4 mr-2" />
                {session.studentId.college}
              </div>
            )}
          </div>
          {session.studentId.interests && session.studentId.interests.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Interests:</p>
              <div className="flex flex-wrap gap-1">
                {session.studentId.interests.slice(0, 3).map((interest, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Session Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {session.sessionType.replace('-', ' ').toUpperCase()}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">{session.duration} minutes</span>
          </div>
        </div>

        {/* Proposed Dates */}
        {session.proposedDates.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Student's Preferred Times:</p>
            <div className="space-y-1">
              {session.proposedDates.slice(0, 3).map((date, index) => (
                <div key={index} className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {formatDate(date)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student Questions */}
        {session.studentQuestions && session.studentQuestions.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Student's Questions:</p>
            <div className="space-y-2">
              {session.studentQuestions.map((question, index) => (
                <div key={index} className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded border border-blue-100">
                  {question}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mentor Notes */}
        {session.mentorNotes && (
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900 mb-2">Your Notes:</p>
            <p className="text-sm text-gray-600 bg-yellow-50 px-3 py-2 rounded border border-yellow-100">
              {session.mentorNotes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {session.status === 'requested' && (
            <>
              <button
                onClick={() => onAction(session, 'accept')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Accept Request
              </button>
              <button
                onClick={() => onAction(session, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Reject
              </button>
            </>
          )}
          {session.status === 'accepted' && (
            <button
              onClick={() => onAction(session, 'schedule')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Schedule Session
            </button>
          )}
          {session.status === 'scheduled' && (
            <button
              onClick={() => onAction(session, 'complete')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              Mark Complete
            </button>
          )}
          {(session.status === 'requested' || session.status === 'accepted' || session.status === 'scheduled') && (
            <button
              onClick={() => onAction(session, 'cancel')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          )}
        </div>

        {/* Timestamps */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Requested: {formatDate(session.requestedAt)}
          </p>
        </div>
      </div>
    </div>
  );
}