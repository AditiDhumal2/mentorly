'use client';

import { Moderator } from '@/types/community';
import { removeModerator } from '@/actions/moderator-actions';
import { useState } from 'react';
import Snackbar from '@/components/Snackbar';
import ConfirmationModal from '@/components/ConfirmationModal';

interface ModeratorListProps {
  moderators: Moderator[];
  onModeratorRemoved: (userId: string) => void;
}

const CATEGORY_NAMES: { [key: string]: string } = {
  'higher-education': 'Higher Education',
  'market-trends': 'Market Trends',
  'domains': 'Domains & Specializations',
  'placements': 'Placements & Careers',
  'general': 'General Discussion',
  'academic': 'Academic Help',
  'career': 'Career Advice',
  'technical': 'Technical Help',
  'announcement': 'Announcements'
};

export default function ModeratorList({ moderators, onModeratorRemoved }: ModeratorListProps) {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  const [confirmationModal, setConfirmationModal] = useState({
    open: false,
    moderator: null as { userId: string; userName: string } | null,
    loading: false
  });

  const handleRemoveClick = (userId: string, userName: string) => {
    setConfirmationModal({
      open: true,
      moderator: { userId, userName },
      loading: false
    });
  };

  const handleConfirmRemove = async () => {
    if (!confirmationModal.moderator) return;

    setConfirmationModal(prev => ({ ...prev, loading: true }));

    const result = await removeModerator(confirmationModal.moderator.userId);
    
    if (result.success) {
      onModeratorRemoved(confirmationModal.moderator.userId);
      setSnackbar({
        open: true,
        message: 'Moderator removed successfully',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Failed to remove moderator',
        severity: 'error'
      });
    }

    setConfirmationModal({
      open: false,
      moderator: null,
      loading: false
    });
  };

  const handleCloseConfirmation = () => {
    setConfirmationModal({
      open: false,
      moderator: null,
      loading: false
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (moderators.length === 0) {
    return (
      <>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="text-gray-400 text-6xl mb-4">👨‍💼</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Moderators Assigned</h3>
          <p className="text-gray-600 mb-4">
            Assign moderators to help manage the community forum content.
          </p>
        </div>

        <Snackbar
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Current Moderators</h3>
        </div>
        
        <div className="divide-y divide-gray-200">
          {moderators.map((moderator) => (
            <div key={moderator.userId} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h4 className="text-lg font-semibold text-gray-800">{moderator.userName}</h4>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      moderator.userRole === 'student' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {moderator.userRole}
                    </span>
                  </div>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Assigned Categories:</h5>
                    <div className="flex flex-wrap gap-2">
                      {moderator.assignedCategories.map(categoryId => (
                        <span
                          key={categoryId}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border"
                        >
                          {CATEGORY_NAMES[categoryId] || categoryId}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600">
                    Assigned on: {new Date(moderator.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <button
                  onClick={() => handleRemoveClick(moderator.userId, moderator.userName)}
                  className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.open}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmRemove}
        title="Remove Moderator"
        message={`Are you sure you want to remove ${confirmationModal.moderator?.userName} as moderator?`}
        confirmText="Remove Moderator"
        cancelText="Cancel"
        type="danger"
        isLoading={confirmationModal.loading}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
}