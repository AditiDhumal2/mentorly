'use client';

import { useState, useEffect } from 'react';
import { Language, languages } from '../../../lib/languages';
import { updatePreferredLanguageAction } from '../../../actions/language-actions';
import { getRoadmapAction } from '../../../actions/roadmap-actions';
import { 
  getUserProgressStatsAction, 
  getRoadmapProgressAction,
  trackResourceViewAction,
  trackTimeSpentAction,
  trackSubmissionAction,
  markStepCompletedAction,
  getStepEngagementAction
} from '../../../actions/auto-progress-actions';
import RoadmapView from './roadmap-view';

interface RoadmapClientProps {
  roadmap: any;
  progress: any;
  currentYear: number;
  userId: string;
  languages: Language[];
  userLanguage: Language;
  preferredLanguage: string;
}

interface ProgressStats {
  completedSteps: number;
  totalSteps: number;
  completionRate: number;
  totalTimeSpent: number;
  resourcesViewed: number;
  currentStreak: number;
  longestStreak: number;
  averageEngagement: number;
  totalCodeSubmissions: number;
  totalProjectSubmissions: number;
  autoCompletedSteps: number;
}

export default function RoadmapClient({
  roadmap: initialRoadmap,
  progress: initialProgress,
  currentYear,
  userId,
  languages,
  userLanguage,
  preferredLanguage
}: RoadmapClientProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(userLanguage);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [progress, setProgress] = useState(initialProgress);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [engagementData, setEngagementData] = useState<{[key: string]: any}>({});

  // Normalize progress data to always be an array
  const normalizeProgress = (progressData: any): any[] => {
    if (!progressData) return [];
    
    if (Array.isArray(progressData)) {
      return progressData;
    } else if (progressData && typeof progressData === 'object') {
      // Handle different progress data structures
      if (Array.isArray(progressData.progress)) {
        return progressData.progress;
      } else if (Array.isArray(progressData.steps)) {
        return progressData.steps;
      } else if (progressData.completedSteps !== undefined) {
        // Convert object format to array
        return Object.keys(progressData).map(key => ({
          stepId: key,
          completed: progressData[key].completed || false,
          ...progressData[key]
        }));
      }
    }
    
    return [];
  };

  const normalizedProgress = normalizeProgress(progress);

  useEffect(() => {
    setSelectedLanguage(userLanguage);
    loadProgressStats();
    loadEngagementData();
  }, [userLanguage, userId]);

  const loadProgressStats = async () => {
    try {
      const result = await getUserProgressStatsAction(userId);
      if (result.success && result.data) {
        setProgressStats(result.data);
      }
    } catch (error) {
      console.error('Error loading progress stats:', error);
    }
  };

  const loadEngagementData = async () => {
    if (!roadmap?.steps) return;
    
    try {
      const engagementMap: {[key: string]: any} = {};
      
      for (const step of roadmap.steps) {
        const result = await getStepEngagementAction(userId, step._id);
        if (result.success && result.data) {
          engagementMap[step._id] = result.data;
        }
      }
      
      setEngagementData(engagementMap);
    } catch (error) {
      console.error('Error loading engagement data:', error);
    }
  };

  const handleLanguageChange = async (languageId: string) => {
    const newLanguage = languages.find(lang => lang.id === languageId);
    if (!newLanguage) return;

    setIsUpdating(true);
    setIsLoading(true);
    
    try {
      // 1. Update user's preferred language
      const result = await updatePreferredLanguageAction(userId, languageId);
      
      if (result.success) {
        setSelectedLanguage(newLanguage);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        
        // 2. Fetch new roadmap data for the selected language
        const [newRoadmapResult, newProgressResult] = await Promise.all([
          getRoadmapAction(currentYear, languageId),
          getRoadmapProgressAction(userId, languageId)
        ]);
        
        if (newRoadmapResult.success && newRoadmapResult.data) {
          setRoadmap(newRoadmapResult.data);
        }
        
        // Normalize progress data before setting it
        if (newProgressResult.success && newProgressResult.data) {
          const normalizedProgress = normalizeProgress(newProgressResult.data);
          setProgress(normalizedProgress);
        } else {
          setProgress([]);
        }
        
        // 3. Reload progress stats and engagement data
        await loadProgressStats();
        await loadEngagementData();
        
      } else {
        console.error('Failed to update language:', result.error);
        setProgress([]); // Reset progress on failure
      }
    } catch (error) {
      console.error('Error updating language:', error);
      setProgress([]); // Reset progress on error
    } finally {
      setIsUpdating(false);
      setIsLoading(false);
    }
  };

  // Enhanced progress tracking functions with error handling
  const trackResourceView = async (stepId: string, resource: any) => {
    try {
      const result = await trackResourceViewAction(
        userId, 
        stepId, 
        resource.url, 
        resource.type,
        roadmap
      );
      
      if (result.success) {
        // Refresh progress data
        await loadProgressStats();
        await loadEngagementData();
      }
    } catch (error) {
      console.error('Error tracking resource view:', error);
    }
  };

  const trackVideoProgress = async (stepId: string, timeSpent: number) => {
    try {
      const result = await trackTimeSpentAction(
        userId, 
        stepId, 
        timeSpent,
        roadmap
      );
      
      if (result.success) {
        await loadProgressStats();
        await loadEngagementData();
      }
    } catch (error) {
      console.error('Error tracking video progress:', error);
    }
  };

  const trackQuizCompletion = async (stepId: string, score: number) => {
    try {
      const result = await trackSubmissionAction(
        userId, 
        stepId, 
        'code', 
        { score, type: 'quiz' },
        roadmap
      );
      
      if (result.success) {
        await loadProgressStats();
        await loadEngagementData();
      }
    } catch (error) {
      console.error('Error tracking quiz completion:', error);
    }
  };

  const handleManualComplete = async (stepId: string) => {
    try {
      const result = await markStepCompletedAction(userId, stepId);
      if (result.success) {
        await loadProgressStats();
        await loadEngagementData();
      }
    } catch (error) {
      console.error('Error marking step as complete:', error);
    }
  };

  const formatTime = (minutes: number): string => {
    if (!minutes || minutes < 0) return '0m';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Calculate safe progress statistics for display
  const getSafeProgressStats = () => {
    if (!progressStats) return null;

    return {
      completedSteps: progressStats.completedSteps || 0,
      totalSteps: progressStats.totalSteps || 0,
      completionRate: progressStats.completionRate || 0,
      totalTimeSpent: progressStats.totalTimeSpent || 0,
      resourcesViewed: progressStats.resourcesViewed || 0,
      currentStreak: progressStats.currentStreak || 0,
      longestStreak: progressStats.longestStreak || 0,
      averageEngagement: progressStats.averageEngagement || 0,
      totalCodeSubmissions: progressStats.totalCodeSubmissions || 0,
      totalProjectSubmissions: progressStats.totalProjectSubmissions || 0,
      autoCompletedSteps: progressStats.autoCompletedSteps || 0
    };
  };

  const safeProgressStats = getSafeProgressStats();

  return (
    <div className="min-h-screen">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Language updated to {selectedLanguage.name}! Loading roadmap...</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading {selectedLanguage.name} roadmap...</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/60">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Learning Roadmap
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Your personalized path to mastering {selectedLanguage.name}
                  </p>
                </div>
              </div>

              {/* Progress Stats */}
              {safeProgressStats && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-700">
                      {safeProgressStats.completedSteps}/{safeProgressStats.totalSteps}
                    </div>
                    <div className="text-xs text-blue-600">Steps Completed</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-700">
                      {safeProgressStats.completionRate}%
                    </div>
                    <div className="text-xs text-green-600">Overall Progress</div>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-700">
                      {formatTime(safeProgressStats.totalTimeSpent)}
                    </div>
                    <div className="text-xs text-purple-600">Time Invested</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <div className="text-2xl font-bold text-orange-700">
                      {safeProgressStats.currentStreak}
                    </div>
                    <div className="text-xs text-orange-600">Current Streak</div>
                  </div>
                  <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                    <div className="text-2xl font-bold text-red-700">
                      {safeProgressStats.autoCompletedSteps}
                    </div>
                    <div className="text-xs text-red-600">Auto-Completed</div>
                  </div>
                  <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-700">
                      {safeProgressStats.averageEngagement}%
                    </div>
                    <div className="text-xs text-indigo-600">Avg Engagement</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Language Selector */}
              <div className="flex flex-col gap-2">
                <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
                  Programming Language
                </label>
                <div className="relative">
                  <select
                    id="language-select"
                    value={selectedLanguage.id}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={isUpdating || isLoading}
                    className="appearance-none w-64 px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white pr-10 cursor-pointer"
                  >
                    {languages.map((language) => (
                      <option key={language.id} value={language.id}>
                        {language.icon} {language.name} • {language.difficulty}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* YouTube Tutorial Link */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 opacity-0">
                  Tutorial
                </label>
                <a
                  href={selectedLanguage.youtubePlaylist}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-xl hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  Watch Tutorials
                </a>
              </div>
            </div>
          </div>

          {/* Selected Language Info */}
          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-100 rounded-2xl border border-blue-200/50">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-white rounded-xl border border-blue-200 flex items-center justify-center text-3xl">
                {selectedLanguage.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-blue-900">
                    Learning {selectedLanguage.name}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    {selectedLanguage.difficulty} Level
                  </span>
                  {safeProgressStats && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      {safeProgressStats.completionRate}% Complete
                    </span>
                  )}
                </div>
                <p className="text-blue-800 mb-3">
                  {selectedLanguage.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <a
                    href={selectedLanguage.youtubePlaylist}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-700 text-sm font-medium rounded-lg hover:bg-blue-50 transition-colors border border-blue-200"
                  >
                    <span>📺</span>
                    Complete YouTube Playlist
                  </a>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-700 text-sm font-medium rounded-lg border border-blue-200/50">
                    <span>🎯</span>
                    Year {currentYear} Focus
                  </div>
                  {safeProgressStats && (
                    <>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-700 text-sm font-medium rounded-lg border border-green-200/50">
                        <span>⏱️</span>
                        {formatTime(safeProgressStats.totalTimeSpent)} invested
                      </div>
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 text-purple-700 text-sm font-medium rounded-lg border border-purple-200/50">
                        <span>🔥</span>
                        {safeProgressStats.currentStreak} day streak
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="container mx-auto px-4 py-8">
        <RoadmapView
          roadmap={roadmap}
          progress={normalizedProgress} // Pass normalized progress array
          currentYear={currentYear}
          userId={userId}
          selectedLanguage={selectedLanguage}
          engagementData={engagementData}
          onTrackResourceView={trackResourceView}
          onTrackVideoProgress={trackVideoProgress}
          onTrackQuizCompletion={trackQuizCompletion}
          onManualComplete={handleManualComplete}
          onRefreshProgress={loadProgressStats}
        />
      </div>
    </div>
  );
}