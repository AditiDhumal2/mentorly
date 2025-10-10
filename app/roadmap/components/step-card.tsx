'use client';

import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Clock, AlertCircle, Play, CheckCircle, Timer } from 'lucide-react';
import { trackResourceViewAction, trackTimeSpentAction, trackSubmissionAction, getStepEngagementAction } from '../../../actions/auto-progress-actions';

interface StepCardProps {
  step: any;
  index: number;
  isCompleted: boolean;
  userId: string;
}

export default function StepCard({ step, index, isCompleted, userId }: StepCardProps) {
  const [engagement, setEngagement] = useState<any>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Track when user starts viewing this step
  useEffect(() => {
    const trackEngagement = async () => {
      setIsLoading(true);
      try {
        // Load current engagement data
        const engagementResult = await getStepEngagementAction(userId, step._id);
        if (engagementResult.success && engagementResult.data) {
          setEngagement(engagementResult.data);
          setTimeSpent(engagementResult.data.timeSpent);
        }

        // Start activity timer when component mounts (user is viewing the step)
        startActivityTimer();
      } catch (error) {
        console.error('Error loading engagement data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    trackEngagement();

    return () => {
      // Stop timer when component unmounts
      stopActivityTimer();
    };
  }, [userId, step._id]);

  const startActivityTimer = () => {
    startTimeRef.current = Date.now();
    setIsActive(true);

    // Report time spent every 30 seconds
    activityTimerRef.current = setInterval(async () => {
      if (startTimeRef.current) {
        const timeElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60); // in minutes
        if (timeElapsed > 0) {
          try {
            await trackTimeSpentAction(userId, step._id, timeElapsed);
            setTimeSpent(prev => prev + timeElapsed);
            startTimeRef.current = Date.now(); // Reset for next interval
            
            // Refresh engagement data after time tracking
            const engagementResult = await getStepEngagementAction(userId, step._id);
            if (engagementResult.success && engagementResult.data) {
              setEngagement(engagementResult.data);
            }
          } catch (error) {
            console.error('Error tracking time:', error);
          }
        }
      }
    }, 30000); // 30 seconds
  };

  const stopActivityTimer = () => {
    if (activityTimerRef.current) {
      clearInterval(activityTimerRef.current);
      activityTimerRef.current = null;
    }

    // Report final time spent
    if (startTimeRef.current) {
      const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000 / 60);
      if (finalTime > 0) {
        trackTimeSpentAction(userId, step._id, finalTime);
        setTimeSpent(prev => prev + finalTime);
      }
      startTimeRef.current = null;
    }

    setIsActive(false);
  };

  const handleResourceClick = async (resourceUrl: string) => {
    try {
      await trackResourceViewAction(userId, step._id, resourceUrl);
      // Refresh engagement data after resource view
      const engagementResult = await getStepEngagementAction(userId, step._id);
      if (engagementResult.success && engagementResult.data) {
        setEngagement(engagementResult.data);
      }
    } catch (error) {
      console.error('Error tracking resource view:', error);
    }
    // The link will naturally navigate after this
  };

  const handleCodeSubmission = async () => {
    setIsLoading(true);
    try {
      // This would be called when user submits code through an integrated IDE
      await trackSubmissionAction(userId, step._id, 'code', {
        platform: 'integrated',
        language: 'python', // Example
        problemSolved: step.title
      });
      
      // Refresh engagement data after submission
      const engagementResult = await getStepEngagementAction(userId, step._id);
      if (engagementResult.success && engagementResult.data) {
        setEngagement(engagementResult.data);
      }
      
      // Show success feedback (you can replace this with a toast notification)
      alert('Code submission recorded! Your progress has been updated.');
    } catch (error) {
      console.error('Failed to submit code:', error);
      alert('Failed to record code submission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectSubmission = async () => {
    setIsLoading(true);
    try {
      // This would be called when user submits a project
      await trackSubmissionAction(userId, step._id, 'project', {
        projectType: step.category,
        repositoryUrl: 'https://github.com/username/project-name' // User would provide this
      });
      
      // Refresh engagement data after submission
      const engagementResult = await getStepEngagementAction(userId, step._id);
      if (engagementResult.success && engagementResult.data) {
        setEngagement(engagementResult.data);
      }
      
      // Show success feedback
      alert('Project submission recorded! Your progress has been updated.');
    } catch (error) {
      console.error('Failed to submit project:', error);
      alert('Failed to record project submission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGitHubLinkSubmit = () => {
    const repoUrl = prompt('Please enter your GitHub repository URL:');
    if (repoUrl) {
      handleProjectSubmissionWithUrl(repoUrl);
    }
  };

  const handleProjectSubmissionWithUrl = async (repoUrl: string) => {
    setIsLoading(true);
    try {
      await trackSubmissionAction(userId, step._id, 'project', {
        projectType: step.category,
        repositoryUrl: repoUrl
      });
      
      // Refresh engagement data after submission
      const engagementResult = await getStepEngagementAction(userId, step._id);
      if (engagementResult.success && engagementResult.data) {
        setEngagement(engagementResult.data);
      }
      
      alert('Project submission recorded! Your progress has been updated.');
    } catch (error) {
      console.error('Failed to submit project:', error);
      alert('Failed to record project submission. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      skill: 'bg-blue-100 text-blue-800',
      project: 'bg-green-100 text-green-800',
      profile: 'bg-purple-100 text-purple-800',
      career: 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const engagementScore = engagement?.engagementScore || 0;
  const isAutoCompleted = engagement?.autoCompleted || false;
  const resourcesViewed = engagement?.resourcesViewed || 0;

  if (isLoading && !engagement) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="flex-1 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            <div className="h-2 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 transition-all duration-200 ${
      isCompleted ? 'border-green-200 bg-green-50' : 'border-gray-200'
    }`}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {isCompleted ? (
              <CheckCircle className="h-6 w-6" />
            ) : (
              <div className="text-center">
                <div className="text-sm font-bold">{engagementScore}%</div>
                <div className="text-xs">engaged</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {index + 1}. {step.title}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(step.category)}`}>
                  {step.category}
                </span>
                {isActive && (
                  <div className="flex items-center gap-1 text-orange-600">
                    <Timer className="h-4 w-4 animate-pulse" />
                    <span className="text-xs">Active</span>
                  </div>
                )}
                {isLoading && (
                  <div className="flex items-center gap-1 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-xs">Updating...</span>
                  </div>
                )}
              </div>
              
              <p className="text-gray-600 mb-3">{step.description}</p>
              
              {/* Engagement Progress */}
              {!isCompleted && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress towards auto-completion</span>
                    <span>{engagementScore}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${engagementScore}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Time spent: {Math.round(timeSpent)}min</span>
                    <span>Resources: {resourcesViewed} viewed</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {engagementScore >= 70 ? '🎉 Ready for auto-completion!' : `Need ${70 - engagementScore}% more engagement`}
                  </div>
                </div>
              )}
              
              {/* Resources */}
              {step.resources && step.resources.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Learning Resources:</h4>
                  <div className="space-y-1">
                    {step.resources.map((resource: any, idx: number) => (
                      <a
                        key={idx}
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleResourceClick(resource.url)}
                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors group"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {resource.title} ({resource.type})
                        <Play className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons for Submissions */}
              {step.category === 'project' && !isCompleted && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleGitHubLinkSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Submitting...' : 'Submit GitHub Project'}
                  </button>
                </div>
              )}

              {step.category === 'skill' && !isCompleted && (
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={handleCodeSubmission}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Submitting...' : 'Complete Code Exercise'}
                  </button>
                </div>
              )}

              {/* Profile tasks */}
              {step.category === 'profile' && !isCompleted && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Complete these profile tasks:</p>
                  <div className="space-y-2">
                    {step.title.toLowerCase().includes('linkedin') && (
                      <a
                        href="https://linkedin.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Set up LinkedIn Profile
                      </a>
                    )}
                    {step.title.toLowerCase().includes('github') && (
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        Create GitHub Account
                      </a>
                    )}
                  </div>
                </div>
              )}
              
              {/* Meta Information */}
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-3">
                {step.estimatedDuration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Target: {step.estimatedDuration}</span>
                  </div>
                )}
                {step.priority && (
                  <div className="flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>Priority: {step.priority}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {isAutoCompleted && (
          <div className="flex-shrink-0 text-green-600 text-sm font-medium">
            Auto-completed 🎉
          </div>
        )}
      </div>
    </div>
  );
}