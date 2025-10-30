// app/admin/roadmap/components/StepCard.tsx
'use client';

import { useState } from 'react';
import type { RoadmapStep } from '@/types/admin-roadmap';

interface StepCardProps {
  step: RoadmapStep;
  index: number;
  onEdit: (step: RoadmapStep) => void;
  onDelete: (stepId: string) => void;
  onUpdate: (stepId: string, data: Partial<RoadmapStep>) => Promise<any>;
}

export default function StepCard({ step, index, onEdit, onDelete, onUpdate }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Convert step._id to string safely
  const stepId = step._id ? step._id.toString() : `temp-${index}`;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-semibold">
              {index + 1}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <p className="text-gray-600 mt-1">{step.description}</p>
              
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md">
                  {step.category}
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-sm rounded-md">
                  Priority: {step.priority === 1 ? 'High' : step.priority === 2 ? 'Medium' : 'Low'}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-md">
                  {step.estimatedDuration}
                </span>
                {step.languageSpecific && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 text-sm rounded-md">
                    Language Specific
                  </span>
                )}
                {step.applyToAllLanguages && (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-sm rounded-md">
                    🌍 All Languages
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-2 ml-4">
            <button
              onClick={() => onEdit(step)}
              className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(stepId)}
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700 transition-colors"
            >
              {isExpanded ? 'Hide' : 'Show'} Resources
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Learning Resources</h4>
            <div className="space-y-3">
              {step.resources.map((resource, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h5 className="font-medium text-gray-900">{resource.title}</h5>
                    <p className="text-gray-600 text-sm">{resource.description}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                      <span className="text-sm text-gray-500">{resource.duration}</span>
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Open Link
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {step.prerequisites.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Prerequisites</h4>
                <div className="flex flex-wrap gap-2">
                  {step.prerequisites.map((prereq, idx) => (
                    <span key={idx} className="px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-md">
                      {prereq}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}