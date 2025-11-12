// app/admin/verifymentor/components/MentorDetailsModal.tsx
'use client';

import { MentorApplication } from '@/actions/admin-mentor.actions';

interface MentorDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: MentorApplication | null;
  onApprove: () => void;
  onReject: () => void;
}

export default function MentorDetailsModal({
  isOpen,
  onClose,
  mentor,
  onApprove,
  onReject
}: MentorDetailsModalProps) {
  if (!isOpen || !mentor) return null;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{mentor.name}</h2>
              <p className="text-gray-600">{mentor.email}</p>
              <p className="text-gray-600">{mentor.college}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Experience:</span>
                    <p className="text-gray-600">{mentor.experience} years</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Qualification:</span>
                    <p className="text-gray-600">{mentor.qualification}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Applied Date:</span>
                    <p className="text-gray-600">{formatDate(mentor.submittedAt)}</p>
                  </div>
                  {mentor.hourlyRate && mentor.hourlyRate > 0 && (
                    <div>
                      <span className="font-medium text-gray-700">Hourly Rate:</span>
                      <p className="text-gray-600">₹{mentor.hourlyRate}/hour</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Expertise */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Areas of Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((exp, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                    >
                      {exp.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  ))}
                </div>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded border border-green-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio & Introduction</h3>
                <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                  {mentor.bio}
                </p>
              </div>

              {/* Education */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Education Background</h3>
                <div className="space-y-3">
                  {mentor.education.map((edu, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                      <div className="font-medium text-gray-900">{edu.degree}</div>
                      <div className="text-sm text-gray-600">{edu.institution}</div>
                      <div className="text-sm text-gray-500">Graduated {edu.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Professional Profiles */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Professional Profiles</h3>
                <div className="space-y-2 text-sm">
                  {mentor.profiles.linkedin && (
                    <div>
                      <strong>LinkedIn:</strong>{' '}
                      <a 
                        href={mentor.profiles.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {mentor.profiles.linkedin}
                      </a>
                    </div>
                  )}
                  {mentor.profiles.github && (
                    <div>
                      <strong>GitHub:</strong>{' '}
                      <a 
                        href={mentor.profiles.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {mentor.profiles.github}
                      </a>
                    </div>
                  )}
                  {mentor.profiles.portfolio && (
                    <div>
                      <strong>Portfolio:</strong>{' '}
                      <a 
                        href={mentor.profiles.portfolio} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 break-all"
                      >
                        {mentor.profiles.portfolio}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
            <button
              onClick={onReject}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject Application
            </button>
            <button
              onClick={onApprove}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Approve Mentor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}