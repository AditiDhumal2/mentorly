// app/students/highereducation/components/ProgressTracker.tsx - Compact Version
'use client';

import { useState } from 'react';
import { updateProgressStep } from '@/actions/highereducation-students-actions';

const steps = [
  { id: 1, title: 'Research', icon: '🌍', shortDesc: 'Countries & Universities' },
  { id: 2, title: 'Exams', icon: '📝', shortDesc: 'GRE/IELTS/TOEFL' },
  { id: 3, title: 'Documents', icon: '📄', shortDesc: 'SOP, LORs, CV' },
  { id: 4, title: 'Apply', icon: '🏛️', shortDesc: 'Applications' },
  { id: 5, title: 'Visa', icon: '✈️', shortDesc: 'Interview & Process' },
];

interface ProgressTrackerProps {
  currentStep: number;
  completedSteps: number[];
}

export default function ProgressTracker({ currentStep, completedSteps }: ProgressTrackerProps) {
  const [localCompleted, setLocalCompleted] = useState<number[]>(completedSteps);

  const handleStepToggle = async (stepId: number) => {
    const newCompleted = localCompleted.includes(stepId)
      ? localCompleted.filter(id => id !== stepId)
      : [...localCompleted, stepId];
    
    setLocalCompleted(newCompleted);
    
    try {
      await updateProgressStep(stepId, !localCompleted.includes(stepId));
    } catch (error) {
      setLocalCompleted(completedSteps);
    }
  };

  const progressPercentage = Math.round((localCompleted.length / steps.length) * 100);

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
            <span className="text-white text-sm">🎯</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Application Journey</h3>
            <p className="text-gray-600 text-xs">Complete steps to track progress</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-blue-600">{progressPercentage}%</div>
          <div className="text-xs text-gray-500">Complete</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Steps in Single Row */}
      <div className="flex justify-between space-x-2">
        {steps.map((step, index) => {
          const isCompleted = localCompleted.includes(step.id);
          const isCurrent = step.id === currentStep;

          return (
            <div 
              key={step.id} 
              className={`flex-1 p-2 rounded-lg border text-center cursor-pointer transition-all group ${
                isCompleted 
                  ? 'border-green-200 bg-green-50' 
                  : isCurrent
                  ? 'border-blue-200 bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
              onClick={() => handleStepToggle(step.id)}
              title={step.shortDesc}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 text-sm ${
                isCompleted 
                  ? 'bg-green-500 text-white' 
                  : isCurrent
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? '✓' : step.icon}
              </div>
              
              <div className="text-xs font-medium text-gray-900 mb-1">{step.title}</div>
              <div className="text-xs text-gray-500 truncate">{step.shortDesc}</div>
              
              <div className={`text-xs mt-1 px-1 py-0.5 rounded ${
                isCompleted
                  ? 'bg-green-100 text-green-700'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                {isCompleted ? 'Done' : 'Mark'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}