'use client';

import { useState } from 'react';
import { saveResourceAction } from '@/actions/student-resource-actions';

interface SaveResourceButtonProps {
  resourceId: string;
}

export default function SaveResourceButton({ resourceId }: SaveResourceButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const userId = 'student-user-id'; // Get from session in real app
      const result = await saveResourceAction(userId, resourceId);
      if (result.success) {
        setIsSaved(!isSaved);
      }
    } catch (error) {
      console.error('Error saving resource:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`p-2 rounded-lg transition-colors ${
        isSaved 
          ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={isSaved ? 'Remove from saved' : 'Save resource'}
    >
      {isSaved ? (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      )}
    </button>
  );
}