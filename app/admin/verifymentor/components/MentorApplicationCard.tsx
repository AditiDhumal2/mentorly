// app/admin/verifymentor/components/MentorApplicationCard.tsx
'use client';

import { useState } from 'react';
import { MentorApplication } from '@/actions/admin-mentor.actions';
import ConfirmationModal from '@/components/ConfirmationModal';

interface MentorApplicationCardProps {
  mentor: MentorApplication;
  onApprove: (mentorId: string) => void;
  onReject: (mentorId: string, reason: string) => void;
}

export default function MentorApplicationCard({ 
  mentor, 
  onApprove, 
  onReject 
}: MentorApplicationCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // Confirmation modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const handleApproveClick = () => {
    setShowApproveModal(true);
  };

  const handleConfirmApprove = () => {
    onApprove(mentor._id);
  };

  const handleRejectClick = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    onReject(mentor._id, rejectionReason);
    setShowRejectForm(false);
    setRejectionReason('');
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
              <p className="text-sm text-gray-600">{mentor.email}</p>
              <p className="text-sm text-gray-600">{mentor.college}</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending Review
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Applied: {formatDate(mentor.submittedAt)}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-900">Experience:</span>
              <p className="text-gray-600">{mentor.experience} years</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Qualification:</span>
              <p className="text-gray-600">{mentor.qualification}</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Expertise:</span>
              <p className="text-gray-600">{mentor.expertise.length} areas</p>
            </div>
            <div>
              <span className="font-medium text-gray-900">Skills:</span>
              <p className="text-gray-600">{mentor.skills.length} skills</p>
            </div>
          </div>

          {/* Bio Preview */}
          <div className="mt-4">
            <p className="text-sm text-gray-600 line-clamp-2">
              {mentor.bio}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
            >
              {showDetails ? 'Hide Details' : 'View Details'}
            </button>
            
            <button
              onClick={handleApproveClick}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Approve
            </button>
            
            <button
              onClick={() => setShowRejectForm(true)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Reject
            </button>
          </div>

          {/* Rejection Form */}
          {showRejectForm && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">Rejection Reason</h4>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                className="w-full border border-red-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={() => {
                    setShowRejectForm(false);
                    setRejectionReason('');
                  }}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectClick}
                  className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Information */}
        {showDetails && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            {/* ... your existing details code ... */}
          </div>
        )}
      </div>

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleConfirmApprove}
        title="Approve Mentor"
        message={`Are you sure you want to approve ${mentor.name} as a mentor?`}
        confirmText="Yes, Approve"
        type="success"
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={handleConfirmReject}
        title="Reject Mentor Application"
        message={`Are you sure you want to reject ${mentor.name}'s application? This action cannot be undone.`}
        confirmText="Yes, Reject"
        type="danger"
      />
    </>
  );
}