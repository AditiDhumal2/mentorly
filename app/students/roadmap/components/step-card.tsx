// app/students/roadmap/components/StepCard.tsx
'use client';

import { useState } from 'react';
import type { StepCardProps, QuickAction, Resource, RoadmapStep } from '@/types/student-roadmap';

// Default quick actions (fallback if none are saved)
const defaultQuickActions: QuickAction[] = [
  {
    id: '1',
    title: '+30min Study Time',
    description: 'Track 30 minutes of focused study time',
    type: 'study',
    duration: '30min',
    icon: '📚',
    color: 'blue',
    difficulty: 'beginner',
    category: 'study',
    tags: ['quick', 'study', 'time-tracking'],
    isActive: true,
    points: 30,
    link: '/study-timer',
    targetResource: 'study',
    targetLanguage: 'all',
    targetYear: 0
  },
  {
    id: '2',
    title: 'Complete Practice Quiz',
    description: 'Mark a practice quiz as completed',
    type: 'quiz',
    duration: '15min',
    icon: '🧠',
    color: 'purple',
    difficulty: 'intermediate',
    category: 'quiz',
    tags: ['quick', 'quiz', 'assessment'],
    isActive: true,
    points: 85,
    link: '/quizzes',
    targetResource: 'quiz',
    targetLanguage: 'all',
    targetYear: 0
  },
  {
    id: '3',
    title: 'Submit Code Exercise',
    description: 'Submit a coding exercise for review',
    type: 'exercise',
    duration: '45min',
    icon: '💻',
    color: 'green',
    difficulty: 'intermediate',
    category: 'exercise',
    tags: ['quick', 'coding', 'practice'],
    isActive: true,
    points: 100,
    link: '/exercises',
    targetResource: 'exercise',
    targetLanguage: 'all',
    targetYear: 0
  }
];

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

  // Convert step._id to string safely
  const stepId = step._id ? step._id.toString() : `step-${index}`;

  // Get admin-configured quick actions
  const getAdminQuickActions = (): QuickAction[] => {
    try {
      if (typeof window !== 'undefined') {
        const savedActions = localStorage.getItem('admin-quick-actions');
        if (savedActions) {
          const actions = JSON.parse(savedActions) as QuickAction[];
          // Only return active actions
          return actions.filter((action: QuickAction) => action.isActive !== false);
        }
      }
    } catch (error) {
      console.error('Error loading admin quick actions:', error);
    }
    
    // Fallback to defaults (only active ones)
    return defaultQuickActions.filter(action => action.isActive !== false);
  };

  const handleResourceClick = async (resource: Resource) => {
    await onTrackResourceView(stepId, resource);
  };

  const handleVideoProgress = async (minutes: number) => {
    await onTrackVideoProgress(stepId, minutes);
  };

  const handleQuizComplete = async (score: number) => {
    await onTrackQuizCompletion(stepId, score);
  };

  const handleManualComplete = async () => {
    setIsCompleting(true);
    try {
      await onManualComplete(stepId);
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle quick action clicks with link support
  const handleQuickAction = async (action: QuickAction) => {
    // If action has a link, navigate to it
    if (action.link) {
      window.open(action.link, '_blank');
    }
    
    // If action has a resource URL, open it
    if (action.resourceUrl) {
      window.open(action.resourceUrl, '_blank');
    }

    // Track the action based on type
    switch (action.type) {
      case 'study':
        const studyMinutes = parseDurationToMinutes(action.duration);
        await handleVideoProgress(studyMinutes);
        break;
      
      case 'quiz':
        await handleQuizComplete(action.points);
        break;
      
      case 'exercise':
        await handleQuizComplete(action.points);
        break;
      
      case 'video':
        const videoMinutes = parseDurationToMinutes(action.duration);
        await handleVideoProgress(videoMinutes);
        break;
      
      default:
        const defaultMinutes = parseDurationToMinutes(action.duration);
        await handleVideoProgress(defaultMinutes);
        break;
    }
  };

  const parseDurationToMinutes = (duration: string): number => {
    if (!duration) return 30;
    
    const lowerDuration = duration.toLowerCase();
    
    if (lowerDuration.includes('15min') || lowerDuration.includes('15 min')) return 15;
    if (lowerDuration.includes('30min') || lowerDuration.includes('30 min')) return 30;
    if (lowerDuration.includes('45min') || lowerDuration.includes('45 min')) return 45;
    if (lowerDuration.includes('1h') || lowerDuration.includes('1 hour')) return 60;
    if (lowerDuration.includes('2h') || lowerDuration.includes('2 hours')) return 120;
    
    return 30;
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

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 hover:shadow-md',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200 hover:shadow-md',
      green: 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200 hover:shadow-md',
      red: 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200 hover:shadow-md',
      yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 hover:shadow-md'
    };
    return colors[color] || colors.blue;
  };

  const getActionIcon = (action: QuickAction) => {
    if (action.link || action.resourceUrl) {
      return '🔗'; // Link icon for actions with URLs
    }
    return action.icon;
  };

  const quickActions = getAdminQuickActions();

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
            {step.resources?.map((resource: Resource, resourceIndex: number) => (
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
                        handleVideoProgress(30);
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

          {/* Admin-Configured Quick Actions with Links */}
          {quickActions.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span>⚡</span>
                Quick Actions
                <span className="text-sm text-gray-500 font-normal">
                  ({quickActions.length} available)
                </span>
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {quickActions.map((action, actionIndex) => (
                  <button
                    key={actionIndex}
                    onClick={() => handleQuickAction(action)}
                    className={`p-3 rounded-lg border transition-all duration-200 font-medium text-left group ${getColorClasses(action.color)}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getActionIcon(action)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm leading-tight">
                          {action.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                          {action.description}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs px-1.5 py-0.5 bg-white/50 rounded">
                            {action.duration}
                          </span>
                          {(action.link || action.resourceUrl) && (
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              <span>🔗</span>
                              <span>Link</span>
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Quick Actions Info */}
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <span className="text-blue-500">💡</span>
                  <div className="text-xs text-blue-700">
                    <strong>Tip:</strong> Quick actions with link icons (🔗) will open external resources. 
                    All actions automatically track your progress.
                  </div>
                </div>
              </div>
            </div>
          )}

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