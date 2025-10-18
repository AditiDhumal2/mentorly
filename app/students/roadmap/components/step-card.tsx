'use client';

import { useState } from 'react';

interface StepCardProps {
  step: any;
  index: number;
  isCompleted: boolean;
  userId: string;
  engagementData: any;
  onTrackResourceView: (stepId: string, resource: any) => Promise<void>;
  onTrackVideoProgress: (stepId: string, timeSpent: number) => Promise<void>;
  onTrackQuizCompletion: (stepId: string, score: number) => Promise<void>;
  onManualComplete: (stepId: string) => Promise<void>;
}

export default function StepCard({
  step,
  index,
  isCompleted,
  userId,
  engagementData,
  onTrackResourceView,
  onTrackVideoProgress,
  onTrackQuizCompletion,
  onManualComplete
}: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleResourceClick = async (resource: any) => {
    await onTrackResourceView(step._id, resource);
  };

  const handleVideoProgress = async (minutes: number) => {
    await onTrackVideoProgress(step._id, minutes);
  };

  const handleQuizComplete = async (score: number) => {
    await onTrackQuizCompletion(step._id, score);
  };

  const handleManualComplete = async () => {
    setIsCompleting(true);
    try {
      await onManualComplete(step._id);
    } finally {
      setIsCompleting(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getProgressPercentage = () => {
    return engagementData?.progressPercentage || 0;
  };

  const getEngagementScore = () => {
    return engagementData?.engagementScore || 0;
  };

  const getTimeSpent = () => {
    return engagementData?.timeSpent || 0;
  };

  const getResourcesViewed = () => {
    return engagementData?.resourcesViewed || 0;
  };

  const isAutoCompleted = engagementData?.autoCompleted || false;

  return (
    <div className={`bg-white rounded-2xl border-2 transition-all duration-300 hover:shadow-lg ${
      isCompleted 
        ? 'border-green-500 bg-green-50' 
        : getProgressPercentage() > 50 
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Step Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Step Number */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
              isCompleted 
                ? 'bg-green-500' 
                : getProgressPercentage() > 50 
                  ? 'bg-yellow-500'
                  : 'bg-gray-400'
            }`}>
              {index + 1}
            </div>
            
            {/* Step Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-900">
                  {step.title}
                </h3>
                {isCompleted && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    {isAutoCompleted ? 'Auto-Completed' : 'Completed'}
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 mb-4">
                {step.description}
              </p>
              
              {/* Engagement Metrics */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <span>🎯</span>
                  <span>{getEngagementScore()}% engagement</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏱️</span>
                  <span>{formatTime(getTimeSpent())}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📚</span>
                  <span>{getResourcesViewed()}/{step.resources?.length || 0} resources</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📊</span>
                  <span>{getProgressPercentage()}% progress</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {!isCompleted && (
              <button
                onClick={handleManualComplete}
                disabled={isCompleting}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {isCompleting ? 'Completing...' : 'Mark Complete'}
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              {isExpanded ? 'Hide Resources' : 'Show Resources'}
            </button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step Progress</span>
            <span>{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                getProgressPercentage() >= 100 ? 'bg-green-500' :
                getProgressPercentage() >= 70 ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Expandable Resources Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-6 bg-gray-50/50">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>📚</span>
            Learning Resources
            <span className="text-sm text-gray-500 font-normal">
              ({step.resources?.length || 0} available)
            </span>
          </h4>
          
          <div className="grid gap-3">
            {step.resources?.map((resource: any, resourceIndex: number) => (
              <a
                key={resourceIndex}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleResourceClick(resource)}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex-1 min-w-0">
                  <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h5>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500 capitalize">{resource.type}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-sm text-gray-500">{step.estimatedDuration}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {resource.type === 'video' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleVideoProgress(30); // Track 30 minutes of video watching
                      }}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded hover:bg-blue-200 transition-colors"
                    >
                      +30min
                    </button>
                  )}
                  <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h5 className="font-medium text-gray-900 mb-3">Quick Actions</h5>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleVideoProgress(30)}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
              >
                +30min Study Time
              </button>
              <button
                onClick={() => handleQuizComplete(85)}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm hover:bg-purple-200 transition-colors"
              >
                Complete Practice Quiz
              </button>
              <button
                onClick={() => handleQuizComplete(100)}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
              >
                Submit Code Exercise
              </button>
            </div>
          </div>

          {/* Step Metadata */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Category:</span>
                <span className="ml-2 text-gray-900 font-medium capitalize">{step.category}</span>
              </div>
              <div>
                <span className="text-gray-500">Duration:</span>
                <span className="ml-2 text-gray-900 font-medium">{step.estimatedDuration}</span>
              </div>
              <div>
                <span className="text-gray-500">Priority:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  {step.priority === 1 ? 'High' : step.priority === 2 ? 'Medium' : 'Low'}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Language Specific:</span>
                <span className="ml-2 text-gray-900 font-medium">
                  {step.languageSpecific ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}