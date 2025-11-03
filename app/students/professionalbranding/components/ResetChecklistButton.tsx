// app/students/professionalbranding/components/ResetChecklistButton.tsx
'use client';

import { resetBrandingChecklist } from '@/actions/professionalbranding-students-actions';
import { useState } from 'react';

export function ResetChecklistButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const result = await resetBrandingChecklist();
      if (result.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to reset checklist:', error);
    } finally {
      setIsLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Reset Checklist?
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          This will clear all your progress. This action cannot be undone.
        </p>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            disabled={isLoading}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 disabled:opacity-50"
          >
            {isLoading ? 'Resetting...' : 'Yes, Reset'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isLoading}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">
        New Academic Year?
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Start fresh with a new checklist for the next year.
      </p>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
      >
        Reset Checklist for Next Year
      </button>
    </div>
  );
}