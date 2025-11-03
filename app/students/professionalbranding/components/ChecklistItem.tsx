// app/students/professionalbranding/components/ChecklistItem.tsx
'use client';

import { BrandingTask } from '@/types/professionalBranding';
import { updateBrandingProgress } from '@/actions/professionalbranding-students-actions';
import { useState } from 'react';
import { categoryIcons, categoryColors } from '@/utils/professional-branding-utils';

interface ChecklistItemProps {
  task: BrandingTask;
  completed: boolean;
}

export function ChecklistItem({ task, completed }: ChecklistItemProps) {
  const [isCompleted, setIsCompleted] = useState(completed);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const result = await updateBrandingProgress(task._id, !isCompleted);
      if (result.success) {
        setIsCompleted(!isCompleted);
      } else {
        console.error('Failed to update progress:', result.error);
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all duration-200 ${
      isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    } ${categoryColors[task.category]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <button
            onClick={handleToggle}
            disabled={isLoading}
            className={`w-6 h-6 rounded border-2 mt-0.5 flex items-center justify-center transition-colors ${
              isCompleted 
                ? 'bg-green-500 border-green-500 text-white' 
                : 'border-gray-300 bg-white'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-green-400'}`}
          >
            {isCompleted && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-lg">{categoryIcons[task.category]}</span>
              <h3 className={`font-medium ${
                isCompleted ? 'text-green-700 line-through' : 'text-gray-800'
              }`}>
                {task.title}
              </h3>
              {task.optional && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  Optional
                </span>
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
            
            {task.tutorial && (
              <a 
                href={task.tutorial.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center space-x-1 mb-2"
              >
                <span>📚</span>
                <span>Watch Tutorial: {task.tutorial.title}</span>
              </a>
            )}
            
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">
                Complete by: {task.doneBy}
              </span>
              <span className="text-xs text-gray-400 capitalize">
                {task.category}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}