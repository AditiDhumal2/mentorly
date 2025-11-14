// components/session-action-modal.tsx
'use client';

import { useState } from 'react';
import { X, Calendar, Link, FileText, Loader2, Video, MessageCircle } from 'lucide-react';
import { MentorSession } from '@/types/mentor-sessions';

interface SessionActionModalProps {
  session: MentorSession | null;
  action: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: any) => void;
  isLoading?: boolean;
}

export default function SessionActionModal({
  session,
  action,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false
}: SessionActionModalProps) {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    meetingLink: '',
    sessionMode: 'video-call', // 'text-chat' | 'video-call' | 'in-person'
    meetingPlatform: 'google-meet', // 'google-meet' | 'zoom' | 'teams' | 'other'
    mentorNotes: '',
    mentorPlan: {
      title: '',
      description: '',
      steps: [{
        title: '',
        description: '',
        resources: [{ title: '', url: '' }],
        deadline: ''
      }]
    }
  });

  if (!isOpen || !session) return null;

  const getActionTitle = () => {
    const titles = {
      accept: 'Accept Session Request',
      reject: 'Reject Session Request',
      schedule: 'Schedule Session',
      complete: 'Complete Session',
      cancel: 'Cancel Session'
    };
    return titles[action as keyof typeof titles] || 'Session Action';
  };

  const getActionDescription = () => {
    const descriptions = {
      accept: 'Accept this session request and provide initial guidance to the student.',
      reject: 'Reject this session request with a reason.',
      schedule: 'Schedule the session by selecting a date and providing meeting details.',
      complete: 'Mark this session as completed.',
      cancel: 'Cancel this session with a reason.'
    };
    return descriptions[action as keyof typeof descriptions] || '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(formData);
  };

  const meetingPlatforms = [
    { value: 'google-meet', label: 'Google Meet', icon: '🔗' },
    { value: 'zoom', label: 'Zoom', icon: '📹' },
    { value: 'teams', label: 'Microsoft Teams', icon: '💼' },
    { value: 'other', label: 'Other Platform', icon: '🔗' }
  ];

  const sessionModes = [
    { value: 'text-chat', label: 'Text Chat Only', description: 'Discuss through messaging', icon: '💬' },
    { value: 'video-call', label: 'Video Call', description: 'Real-time video meeting', icon: '📹' },
    { value: 'in-person', label: 'In-Person', description: 'Face-to-face meeting', icon: '👥' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {getActionTitle()}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {getActionDescription()}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Session Info */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-medium text-gray-900 mb-2">Session Details</h3>
          <p className="text-sm text-gray-600"><strong>Title:</strong> {session.title}</p>
          <p className="text-sm text-gray-600"><strong>Student:</strong> {session.studentId.name}</p>
          <p className="text-sm text-gray-600"><strong>Type:</strong> {session.sessionType}</p>
          <p className="text-sm text-gray-600"><strong>Description:</strong> {session.description}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Mode Selection - Available for accept and schedule actions */}
          {(action === 'accept' || action === 'schedule') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>Session Format</span>
                </div>
                <span className="text-sm text-gray-500 font-normal">
                  Choose how you'd like to conduct this session
                </span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                {sessionModes.map((mode) => (
                  <label key={mode.value} className="relative flex cursor-pointer">
                    <input
                      type="radio"
                      name="sessionMode"
                      value={mode.value}
                      checked={formData.sessionMode === mode.value}
                      onChange={(e) => setFormData({ ...formData, sessionMode: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-full p-4 border-2 rounded-lg transition-all duration-200 ${
                      formData.sessionMode === mode.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}>
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{mode.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{mode.label}</div>
                          <div className="text-sm text-gray-600">{mode.description}</div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.sessionMode === mode.value
                            ? 'border-blue-500 bg-blue-500'
                            : 'border-gray-300'
                        }`} />
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Meeting Link Section - Show only for video calls */}
          {(action === 'accept' || action === 'schedule') && formData.sessionMode === 'video-call' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Link className="w-4 h-4" />
                    <span>Meeting Platform</span>
                  </div>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {meetingPlatforms.map((platform) => (
                    <label key={platform.value} className="relative flex cursor-pointer">
                      <input
                        type="radio"
                        name="meetingPlatform"
                        value={platform.value}
                        checked={formData.meetingPlatform === platform.value}
                        onChange={(e) => setFormData({ ...formData, meetingPlatform: e.target.value })}
                        className="sr-only"
                      />
                      <div className={`w-full p-3 border-2 rounded-lg text-center transition-all duration-200 ${
                        formData.meetingPlatform === platform.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}>
                        <div className="text-lg mb-1">{platform.icon}</div>
                        <div className="text-sm font-medium text-gray-900">{platform.label}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={formData.meetingLink}
                  onChange={(e) => setFormData({ ...formData, meetingLink: e.target.value })}
                  placeholder={
                    formData.meetingPlatform === 'google-meet' 
                      ? 'https://meet.google.com/xxx-xxxx-xxx'
                      : formData.meetingPlatform === 'zoom'
                      ? 'https://zoom.us/j/xxxxxxxxx'
                      : formData.meetingPlatform === 'teams'
                      ? 'https://teams.microsoft.com/l/meetup-join/...'
                      : 'Paste your meeting link here'
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={formData.sessionMode === 'video-call'}
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Students will use this link to join the session
                </p>
              </div>
            </div>
          )}

          {/* In-Person Meeting Instructions */}
          {(action === 'accept' || action === 'schedule') && formData.sessionMode === 'in-person' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <div className="text-yellow-600 text-lg">📍</div>
                <div>
                  <h4 className="font-medium text-yellow-800">In-Person Meeting</h4>
                  <p className="text-yellow-700 text-sm mt-1">
                    Please provide meeting location details in the notes below. Include address, 
                    building name, room number, or any specific instructions for the student.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Scheduling Fields */}
          {action === 'schedule' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4" />
                  <span>Scheduled Date & Time</span>
                </div>
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={isLoading}
              />
            </div>
          )}

          {/* Mentor Notes - Available for all actions except complete */}
          {action !== 'complete' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes & Instructions for Student
              </label>
              <textarea
                value={formData.mentorNotes}
                onChange={(e) => setFormData({ ...formData, mentorNotes: e.target.value })}
                rows={4}
                placeholder={
                  formData.sessionMode === 'video-call' 
                    ? 'Add any pre-session instructions, materials to review, or topics to prepare...' :
                  formData.sessionMode === 'in-person'
                    ? 'Provide meeting location details, what to bring, parking information...' :
                  action === 'accept' ? 'Provide initial guidance or questions for the student...' :
                  action === 'reject' ? 'Explain why you are rejecting this session...' :
                  action === 'schedule' ? 'Add any additional notes for the student...' :
                  'Explain why you are cancelling this session...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required={action === 'reject'}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Mentor Plan - Available for accept action */}
          {action === 'accept' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  <span>Session Plan (Optional)</span>
                </div>
              </label>
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.mentorPlan.title}
                  onChange={(e) => setFormData({
                    ...formData,
                    mentorPlan: { ...formData.mentorPlan, title: e.target.value }
                  })}
                  placeholder="Plan title (e.g., 'Technical Interview Preparation')"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
                <textarea
                  value={formData.mentorPlan.description}
                  onChange={(e) => setFormData({
                    ...formData,
                    mentorPlan: { ...formData.mentorPlan, description: e.target.value }
                  })}
                  rows={2}
                  placeholder="Brief overview of what you'll cover in the session..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center space-x-2 ${
                action === 'reject' || action === 'cancel' 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-blue-600 hover:bg-blue-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isLoading ? 'Processing...' : `Confirm ${action.charAt(0).toUpperCase() + action.slice(1)}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}