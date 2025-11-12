// app/admin/verifymentor/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getPendingMentors, approveMentor, rejectMentor, getMentorStats } from '@/actions/admin-mentor.actions';
import { MentorApplication } from '@/actions/admin-mentor.actions';
import StatsOverview from './components/StatsOverview';
import ConfirmationModal from '@/components/ConfirmationModal';
import MentorDetailsModal from './components/MentorDetailsModal';
import MentorTable from './components/MentorTable';
import BulkActions from './components/BulkActions';
import Messages from './components/Messages';
import Header from './components/Header';

export default function VerifyMentorPage() {
  const [mentors, setMentors] = useState<MentorApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState<any>(null);
  
  // Modals state
  const [selectedMentor, setSelectedMentor] = useState<MentorApplication | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Bulk actions
  const [selectedMentors, setSelectedMentors] = useState<string[]>([]);
  const [showApproveAllModal, setShowApproveAllModal] = useState(false);
  const [showRejectAllModal, setShowRejectAllModal] = useState(false);
  const [rejectAllReason, setRejectAllReason] = useState('');

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
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    // FIXED: Remove adminId parameter
    const result = await approveMentor(mentorId);
    
    if (!result.success) {
      setError(result.error || 'Failed to approve mentor');
    } else {
      setSuccess(result.message || 'Mentor approved successfully');
      setMentors(mentors.filter(m => m._id !== mentorId));
      setSelectedMentors(selectedMentors.filter(id => id !== mentorId));
      
      const statsResult = await getMentorStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    }
    
    setIsProcessing(false);
    setShowApproveModal(false);
    setSelectedMentor(null);
  };

  const handleReject = async (mentorId: string, reason: string) => {
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    // FIXED: Remove adminId parameter
    const result = await rejectMentor(mentorId, reason);
    
    if (!result.success) {
      setError(result.error || 'Failed to reject mentor');
    } else {
      setSuccess(result.message || 'Mentor rejected successfully');
      setMentors(mentors.filter(m => m._id !== mentorId));
      setSelectedMentors(selectedMentors.filter(id => id !== mentorId));
      
      const statsResult = await getMentorStats();
      if (statsResult.success) {
        setStats(statsResult.stats);
      }
    }
    
    setIsProcessing(false);
    setShowRejectModal(false);
    setSelectedMentor(null);
    setRejectionReason('');
  };

  const handleApproveAll = async () => {
    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // FIXED: Remove adminId parameter from all calls
      const results = await Promise.all(
        selectedMentors.map(mentorId => approveMentor(mentorId))
      );

      const failed = results.filter(result => !result.success);
      if (failed.length > 0) {
        setError(`Failed to approve ${failed.length} mentors`);
      } else {
        setSuccess(`Successfully approved ${selectedMentors.length} mentors`);
        setMentors(mentors.filter(m => !selectedMentors.includes(m._id)));
        setSelectedMentors([]);
        
        const statsResult = await getMentorStats();
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      }
    } catch (err) {
      setError('Failed to approve selected mentors');
    } finally {
      setIsProcessing(false);
      setShowApproveAllModal(false);
    }
  };

  const handleRejectAll = async () => {
    if (!rejectAllReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setIsProcessing(true);
    setError('');
    setSuccess('');

    try {
      // FIXED: Remove adminId parameter from all calls
      const results = await Promise.all(
        selectedMentors.map(mentorId => rejectMentor(mentorId, rejectAllReason))
      );

      const failed = results.filter(result => !result.success);
      if (failed.length > 0) {
        setError(`Failed to reject ${failed.length} mentors`);
      } else {
        setSuccess(`Successfully rejected ${selectedMentors.length} mentors`);
        setMentors(mentors.filter(m => !selectedMentors.includes(m._id)));
        setSelectedMentors([]);
        setRejectAllReason('');
        
        const statsResult = await getMentorStats();
        if (statsResult.success) {
          setStats(statsResult.stats);
        }
      }
    } catch (err) {
      setError('Failed to reject selected mentors');
    } finally {
      setIsProcessing(false);
      setShowRejectAllModal(false);
    }
  };

  const handleSelectMentor = (mentorId: string) => {
    setSelectedMentors(prev =>
      prev.includes(mentorId)
        ? prev.filter(id => id !== mentorId)
        : [...prev, mentorId]
    );
  };

  const handleSelectAll = () => {
    setSelectedMentors(
      selectedMentors.length === mentors.length
        ? []
        : mentors.map(m => m._id)
    );
  };

  const openDetailsModal = (mentor: MentorApplication) => {
    setSelectedMentor(mentor);
    setShowDetailsModal(true);
  };

  const openApproveModal = (mentor: MentorApplication) => {
    setSelectedMentor(mentor);
    setShowApproveModal(true);
  };

  const openRejectModal = (mentor: MentorApplication) => {
    setSelectedMentor(mentor);
    setRejectionReason('');
    setShowRejectForm(true);
  };

  const confirmReject = () => {
    if (!rejectionReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    setShowRejectModal(true);
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
        <Header 
          mentorsCount={mentors.length} 
          selectedCount={selectedMentors.length}
          onRefresh={loadData}
        />

        <Messages 
          error={error} 
          success={success} 
          onClearMessages={clearMessages} 
        />

        {stats && <StatsOverview stats={stats} />}

        <div className="bg-white rounded-lg shadow-md">
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
            <MentorTable
              mentors={mentors}
              selectedMentors={selectedMentors}
              onSelectMentor={handleSelectMentor}
              onSelectAll={handleSelectAll}
              onViewDetails={openDetailsModal}
              onApprove={openApproveModal}
              onReject={openRejectModal}
            />
          )}
        </div>

        <BulkActions
          selectedCount={selectedMentors.length}
          onApproveAll={() => setShowApproveAllModal(true)}
          onRejectAll={() => setShowRejectAllModal(true)}
          showRejectForm={showRejectForm}
          rejectAllReason={rejectAllReason}
          onRejectReasonChange={setRejectAllReason}
          onShowRejectForm={() => setShowRejectForm(true)}
          onHideRejectForm={() => {
            setShowRejectForm(false);
            setRejectAllReason('');
          }}
          onConfirmRejectAll={() => setShowRejectAllModal(true)}
        />
      </div>

      {/* Modals */}
      <MentorDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        mentor={selectedMentor}
        onApprove={() => selectedMentor && openApproveModal(selectedMentor)}
        onReject={() => selectedMentor && openRejectModal(selectedMentor)}
      />

      <ConfirmationModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={() => selectedMentor && handleApprove(selectedMentor._id)}
        title="Approve Mentor"
        message={`Are you sure you want to approve ${selectedMentor?.name} as a mentor?`}
        confirmText="Yes, Approve"
        type="success"
        isLoading={isProcessing}
      />

      {/* Reject Form Modal */}
      {showRejectForm && selectedMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectForm(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Mentor Application</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting {selectedMentor.name}'s application:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => setShowRejectForm(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                disabled={!rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={() => selectedMentor && handleReject(selectedMentor._id, rejectionReason)}
        title="Confirm Rejection"
        message={`Are you sure you want to reject ${selectedMentor?.name}'s application?`}
        confirmText="Yes, Reject"
        type="danger"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={showApproveAllModal}
        onClose={() => setShowApproveAllModal(false)}
        onConfirm={handleApproveAll}
        title="Approve Selected Mentors"
        message={`Are you sure you want to approve ${selectedMentors.length} selected mentors?`}
        confirmText={`Approve ${selectedMentors.length} Mentors`}
        type="success"
        isLoading={isProcessing}
      />

      <ConfirmationModal
        isOpen={showRejectAllModal}
        onClose={() => setShowRejectAllModal(false)}
        onConfirm={handleRejectAll}
        title="Reject Selected Mentors"
        message={`Are you sure you want to reject ${selectedMentors.length} selected mentors?`}
        confirmText={`Reject ${selectedMentors.length} Mentors`}
        type="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}