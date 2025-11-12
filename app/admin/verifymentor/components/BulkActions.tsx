// app/admin/verifymentor/components/BulkActions.tsx
'use client';

interface BulkActionsProps {
  selectedCount: number;
  onApproveAll: () => void;
  onRejectAll: () => void;
  showRejectForm: boolean;
  rejectAllReason: string;
  onRejectReasonChange: (reason: string) => void;
  onShowRejectForm: () => void;
  onHideRejectForm: () => void;
  onConfirmRejectAll: () => void;
}

export default function BulkActions({
  selectedCount,
  onApproveAll,
  onRejectAll,
  showRejectForm,
  rejectAllReason,
  onRejectReasonChange,
  onShowRejectForm,
  onHideRejectForm,
  onConfirmRejectAll
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Bulk Actions ({selectedCount} selected)
      </h3>
      
      <div className="flex flex-wrap gap-4">
        <button
          onClick={onApproveAll}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          Approve Selected ({selectedCount})
        </button>
        
        {/* Reject All with Form */}
        <div className="flex flex-col gap-2">
          {!showRejectForm ? (
            <button
              onClick={onShowRejectForm}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reject Selected ({selectedCount})
            </button>
          ) : (
            <div className="flex gap-2 items-start">
              <div className="flex-1">
                <textarea
                  value={rejectAllReason}
                  onChange={(e) => onRejectReasonChange(e.target.value)}
                  placeholder="Enter reason for rejecting all applications..."
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onHideRejectForm}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirmRejectAll}
                  disabled={!rejectAllReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Reject All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}