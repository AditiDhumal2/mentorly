// app/students/sessions/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getStudentSessionRequests } from '@/actions/students-mentorselect-actions';
import { getCurrentUser } from '@/actions/userActions'; // Use existing userActions
import { 
  Calendar, 
  Clock, 
  Video, 
  MapPin, 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock as PendingIcon,
  ExternalLink,
  Mail,
  BookOpen,
  Search
} from 'lucide-react';
import Link from 'next/link';

interface StudentSession {
  _id: string;
  mentor: {
    _id: string;
    name: string;
    email: string;
    college: string;
    expertise: string[];
  };
  sessionType: string;
  title: string;
  description: string;
  status: string;
  proposedDates: string[];
  scheduledDate?: string;
  meetingLink?: string;
  sessionMode?: string;
  meetingPlatform?: string;
  mentorNotes?: string;
  mentorPlan?: any;
  requestedAt: string;
}

export default function StudentSessionsPage() {
  const [sessions, setSessions] = useState<StudentSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Checking student authentication...');
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          console.log('❌ No user found, redirecting to login');
          window.location.href = '/students-auth/login';
          return;
        }

        // Check if user is actually a student
        if (currentUser.role !== 'student') {
          console.log('❌ User is not a student, redirecting');
          window.location.href = '/students-auth/login';
          return;
        }

        setUser(currentUser);

        console.log('🔍 Fetching student sessions...');
        const sessionsResult = await getStudentSessionRequests(currentUser._id);
        if (sessionsResult.success) {
          console.log(`✅ Found ${sessionsResult.sessions.length} sessions`);
          setSessions(sessionsResult.sessions);
        } else {
          console.error('Failed to fetch sessions:', sessionsResult.error);
        }
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ... rest of your component code remains the same
  const getStatusConfig = (status: string) => {
    const configs = {
      requested: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: PendingIcon, 
        text: 'Pending Review' 
      },
      accepted: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: CheckCircle, 
        text: 'Accepted' 
      },
      scheduled: { 
        color: 'bg-purple-100 text-purple-800 border-purple-200', 
        icon: Calendar, 
        text: 'Scheduled' 
      },
      completed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle, 
        text: 'Completed' 
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        text: 'Cancelled' 
      },
      rejected: { 
        color: 'bg-gray-100 text-gray-800 border-gray-200', 
        icon: XCircle, 
        text: 'Rejected' 
      }
    };
    return configs[status as keyof typeof configs] || configs.requested;
  };

  const getSessionModeConfig = (mode?: string) => {
    const configs = {
      'text-chat': { icon: MessageCircle, text: 'Text Chat', color: 'text-purple-600', bgColor: 'bg-purple-100' },
      'video-call': { icon: Video, text: 'Video Call', color: 'text-blue-600', bgColor: 'bg-blue-100' },
      'in-person': { icon: MapPin, text: 'In-Person', color: 'text-green-600', bgColor: 'bg-green-100' }
    };
    return configs[mode as keyof typeof configs] || configs['text-chat'];
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

  const getSessionTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'higher-education': 'Higher Education',
      'career-guidance': 'Career Guidance',
      'technical': 'Technical Skills',
      'placement-prep': 'Placement Prep',
      'study-abroad': 'Study Abroad'
    };
    return types[type] || type;
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    if (filter !== 'all' && session.status !== filter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        session.title.toLowerCase().includes(query) ||
        session.mentor.name.toLowerCase().includes(query) ||
        session.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Session Requests</h1>
          <p className="text-gray-600 mt-2">
            Track your session requests and view mentor responses
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 text-center border">
            <div className="text-2xl font-bold text-blue-600">
              {sessions.filter(s => s.status === 'requested').length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border">
            <div className="text-2xl font-bold text-green-600">
              {sessions.filter(s => s.status === 'accepted' || s.status === 'scheduled').length}
            </div>
            <div className="text-sm text-gray-600">Accepted</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border">
            <div className="text-2xl font-bold text-purple-600">
              {sessions.filter(s => s.status === 'completed').length}
            </div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center border">
            <div className="text-2xl font-bold text-gray-600">
              {sessions.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All', count: sessions.length },
                { key: 'requested', label: 'Pending', count: sessions.filter(s => s.status === 'requested').length },
                { key: 'accepted', label: 'Accepted', count: sessions.filter(s => s.status === 'accepted').length },
                { key: 'scheduled', label: 'Scheduled', count: sessions.filter(s => s.status === 'scheduled').length },
                { key: 'completed', label: 'Completed', count: sessions.filter(s => s.status === 'completed').length },
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                    filter === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sessions List */}
        {filteredSessions.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <div className="text-gray-400 text-6xl mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {sessions.length === 0 ? 'No session requests yet' : 'No sessions match your filters'}
            </h3>
            <p className="text-gray-600 mb-6">
              {sessions.length === 0 
                ? 'Get started by requesting a session with a mentor.' 
                : 'Try adjusting your search or filters.'
              }
            </p>
            {sessions.length === 0 && (
              <Link
                href="/students/mentors"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Find Mentors
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSessions.map((session) => {
              const statusConfig = getStatusConfig(session.status);
              const sessionModeConfig = getSessionModeConfig(session.sessionMode);
              const StatusIcon = statusConfig.icon;
              const ModeIcon = sessionModeConfig.icon;

              return (
                <div key={session._id} className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{session.title}</h3>
                        <p className="text-gray-600">{session.description}</p>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-full border flex items-center space-x-1 ${statusConfig.color}`}>
                        <StatusIcon className="w-4 h-4" />
                        <span>{statusConfig.text}</span>
                      </span>
                    </div>

                    {/* Mentor Info */}
                    <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {session.mentor.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{session.mentor.name}</h4>
                        <p className="text-gray-600 text-sm">{session.mentor.college}</p>
                      </div>
                    </div>

                    {/* Session Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{getSessionTypeLabel(session.sessionType)}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <ModeIcon className={`w-4 h-4 mr-2 ${sessionModeConfig.color}`} />
                        <span>{sessionModeConfig.text}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>Requested: {formatDate(session.requestedAt)}</span>
                      </div>
                    </div>

                    {/* ✅ MENTOR RESPONSE SECTION - This is what students see! */}
                    {(session.status === 'accepted' || session.status === 'scheduled' || session.status === 'completed') && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mentor's Response
                        </h4>
                        
                        {/* Mentor Notes */}
                        {session.mentorNotes && (
                          <div className="mb-3">
                            <p className="text-sm font-medium text-green-800 mb-1">Message from Mentor:</p>
                            <p className="text-green-700 bg-white/50 p-3 rounded border border-green-100">
                              {session.mentorNotes}
                            </p>
                          </div>
                        )}

                        {/* Scheduled Date */}
                        {session.scheduledDate && (
                          <div className="flex items-center text-green-700 mb-2">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">
                              <strong>Scheduled for:</strong> {formatDate(session.scheduledDate)}
                            </span>
                          </div>
                        )}

                        {/* Meeting Link */}
                        {session.meetingLink && session.sessionMode === 'video-call' && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-green-800 mb-2">Join Meeting:</p>
                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium space-x-2"
                            >
                              <Video className="w-4 h-4" />
                              <span>Join Video Call</span>
                            </a>
                            <p className="text-xs text-green-600 mt-1 truncate">
                              {session.meetingLink}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Rejection/Cancellation Message */}
                    {(session.status === 'rejected' || session.status === 'cancelled') && session.mentorNotes && (
                      <div className={`mb-4 p-4 rounded-lg ${
                        session.status === 'rejected' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                      }`}>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <XCircle className="w-4 h-4 mr-2" />
                          {session.status === 'rejected' ? 'Session Not Available' : 'Session Cancelled'}
                        </h4>
                        <p className={session.status === 'rejected' ? 'text-red-700' : 'text-orange-700'}>
                          {session.mentorNotes}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200">
                      {session.status === 'scheduled' && session.meetingLink && (
                        <a
                          href={session.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Join Session
                        </a>
                      )}
                      
                      {(session.status === 'accepted' || session.status === 'scheduled') && (
                        <a
                          href={`mailto:${session.mentor.email}?subject=Session: ${session.title}`}
                          className="px-4 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                        >
                          Contact Mentor
                        </a>
                      )}

                      {session.status === 'completed' && (
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                          Leave Feedback
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}