'use client';

import { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';
import { Mentor } from '@/types/mentor-selection';
import { requestMentorSession } from '@/actions/students-mentorselect-actions';

interface SessionRequestModalProps {
  mentor: Mentor | null;
  studentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

export default function SessionRequestModal({
  mentor,
  studentId,
  isOpen,
  onClose,
  onSuccess,
  onError
}: SessionRequestModalProps) {
  const [formData, setFormData] = useState({
    sessionType: 'career-guidance' as const,
    title: '',
    description: '',
    proposedDates: ['', '', ''] as string[]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !mentor) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const sessionData = {
        studentId,
        mentorId: mentor._id,
        sessionType: formData.sessionType,
        title: formData.title,
        description: formData.description,
        proposedDates: formData.proposedDates
          .filter(date => date)
          .map(date => new Date(date))
      };

      const result = await requestMentorSession(sessionData);

      if (result.success) {
        onSuccess();
        onClose();
        setFormData({
          sessionType: 'career-guidance',
          title: '',
          description: '',
          proposedDates: ['', '', '']
        });
      } else {
        onError(result.error || 'Failed to request session');
      }
    } catch (error) {
      onError('An error occurred while requesting the session');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sessionTypes = {
    'higher-education': 'Higher Education Guidance',
    'career-guidance': 'Career Guidance',
    'technical': 'Technical Skills',
    'placement-prep': 'Placement Preparation',
    'study-abroad': 'Study Abroad Guidance'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Request Session with {mentor.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Type
            </label>
            <select
              value={formData.sessionType}
              onChange={(e) => setFormData({ ...formData, sessionType: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {Object.entries(sessionTypes).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Career path discussion, Technical interview prep..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to discuss?
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="Please describe what you'd like to get from this session, any specific questions, or topics you want to cover..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* Proposed Dates */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Proposed Dates & Times</span>
              </div>
              <span className="text-sm text-gray-500 font-normal">
                Suggest 3 preferred time slots (mentor will choose one)
              </span>
            </label>
            <div className="space-y-3">
              {formData.proposedDates.map((date, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => {
                      const newDates = [...formData.proposedDates];
                      newDates[index] = e.target.value;
                      setFormData({ ...formData, proposedDates: newDates });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending Request...' : 'Send Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}