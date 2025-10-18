'use client';

import { useState, useEffect } from 'react';
import { Language, languages } from '../../../../lib/languages';
import { updatePreferredLanguageAction } from '../../../../actions/language-actions';
import { getRoadmapAction, getUserYearProgressAction } from '../../../../actions/roadmap-actions';
import { 
  getUserProgressStatsAction, 
  getRoadmapProgressAction,
  trackResourceViewAction,
  trackTimeSpentAction,
  trackSubmissionAction,
  markStepCompletedAction,
  getStepEngagementAction
} from '../../../../actions/auto-progress-actions';
import RoadmapView from './roadmap-view';

interface RoadmapClientProps {
  roadmap: any;
  progress: any;
  currentYear: number;
  userId: string;
  languages: Language[];
  userLanguage: Language;
  preferredLanguage: string;
  studentCurrentYear: number;
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

// Year descriptions for different academic years
const YEAR_DESCRIPTIONS = {
  1: {
    title: "Foundation Year - Programming Fundamentals",
    description: "Learn basic programming concepts, algorithms, and problem-solving skills. Master the fundamentals that will support your entire programming journey.",
    focus: "Basic syntax, data structures, algorithms, and logical thinking",
    icon: "🌱",
    color: "green",
    prerequisites: "No prior programming experience required"
  },
  2: {
    title: "Skill Development - Advanced Concepts", 
    description: "Dive deeper into programming concepts and build complex applications. Learn object-oriented programming, databases, and APIs.",
    focus: "OOP, databases, APIs, frameworks, and intermediate projects",
    icon: "🚀",
    color: "blue",
    prerequisites: "Complete Year 1 fundamentals or equivalent knowledge"
  },
  3: {
    title: "Specialization - Domain Expertise",
    description: "Focus on specific domains like web development, mobile apps, or data science. Build real-world projects and specialize in your area of interest.",
    focus: "Advanced frameworks, specialized tools, and real-world projects",
    icon: "🎯",
    color: "purple",
    prerequisites: "Strong grasp of Year 2 concepts"
  },
  4: {
    title: "Placement Preparation - Career Ready",
    description: "Prepare for interviews, build an impressive portfolio, and master advanced concepts. Get ready for your dream job in tech.",
    focus: "System design, interview prep, portfolio development, and soft skills",
    icon: "🏆",
    color: "orange",
    prerequisites: "Completion of Years 1-3 or equivalent experience"
  }
};

const getYearLabel = (year: number) => {
  const labels: { [key: number]: string } = {
    1: '1st Year - Foundation',
    2: '2nd Year - Skill Development', 
    3: '3rd Year - Specialization',
    4: '4th Year - Placement Preparation'
  };
  return labels[year] || `Year ${year}`;
};

export default function RoadmapClient({
  roadmap: initialRoadmap,
  progress: initialProgress,
  currentYear: initialCurrentYear,
  userId,
  languages,
  userLanguage,
  preferredLanguage,
  studentCurrentYear
}: RoadmapClientProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(userLanguage);
  const [selectedYear, setSelectedYear] = useState<number>(initialCurrentYear);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [roadmap, setRoadmap] = useState(initialRoadmap);
  const [progress, setProgress] = useState(initialProgress);
  const [isLoading, setIsLoading] = useState(false);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [engagementData, setEngagementData] = useState<{[key: string]: any}>({});
  const [yearProgress, setYearProgress] = useState<{[key: number]: any}>({});

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
    loadYearProgress();
  }, [userLanguage, userId, selectedYear]);

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

  const loadYearProgress = async () => {
    try {
      const result = await getUserYearProgressAction(userId);
      if (result.success && result.data) {
        setYearProgress(result.data);
      }
    } catch (error) {
      console.error('Error loading year progress:', error);
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
        
        // 2. Fetch new roadmap data for the selected language and year
        const [newRoadmapResult, newProgressResult] = await Promise.all([
          getRoadmapAction(selectedYear, languageId),
          getRoadmapProgressAction(userId, languageId)
        ]);
        
        if (newRoadmapResult.success && newRoadmapResult.data) {
          const updatedRoadmap = updateRoadmapForYear(newRoadmapResult.data, selectedYear);
          setRoadmap(updatedRoadmap);
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

  const handleYearChange = async (year: number) => {
    if (year === selectedYear) return;
    
    setIsLoading(true);
    
    try {
      setSelectedYear(year);
      
      // Fetch roadmap for the selected year and language
      const [newRoadmapResult, newProgressResult] = await Promise.all([
        getRoadmapAction(year, selectedLanguage.id),
        getRoadmapProgressAction(userId, selectedLanguage.id)
      ]);
      
      if (newRoadmapResult.success && newRoadmapResult.data) {
        const updatedRoadmap = updateRoadmapForYear(newRoadmapResult.data, year);
        setRoadmap(updatedRoadmap);
      }
      
      if (newProgressResult.success && newProgressResult.data) {
        const normalizedProgress = normalizeProgress(newProgressResult.data);
        setProgress(normalizedProgress);
      } else {
        setProgress([]);
      }
      
      await loadEngagementData();
      
    } catch (error) {
      console.error('Error changing year:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update roadmap titles and descriptions based on selected year
  const updateRoadmapForYear = (baseRoadmap: any, year: number) => {
    const yearInfo = YEAR_DESCRIPTIONS[year as keyof typeof YEAR_DESCRIPTIONS];
    
    return {
      ...baseRoadmap,
      title: yearInfo?.title || baseRoadmap.title,
      description: yearInfo?.description || baseRoadmap.description,
      year: year,
      // You can add year-specific modifications to steps here
      steps: baseRoadmap.steps?.map((step: any) => ({
        ...step,
        yearContext: `Year ${year} - ${yearInfo?.focus}`
      })) || []
    };
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

  // Get year options with progress information
  const getYearOptions = () => {
    return [1, 2, 3, 4].map(year => {
      const progress = yearProgress[year] || { completed: 0, total: 0 };
      const completionRate = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;
      const yearInfo = YEAR_DESCRIPTIONS[year as keyof typeof YEAR_DESCRIPTIONS];
      
      return {
        value: year,
        label: getYearLabel(year),
        description: yearInfo?.focus,
        isRecommended: year === studentCurrentYear,
        isCompleted: year < studentCurrentYear,
        isFuture: year > studentCurrentYear,
        progress: completionRate,
        icon: yearInfo?.icon || '📚'
      };
    });
  };

  const safeProgressStats = getSafeProgressStats();
  const yearOptions = getYearOptions();
  const currentYearInfo = YEAR_DESCRIPTIONS[selectedYear as keyof typeof YEAR_DESCRIPTIONS];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-500">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Language updated to {selectedLanguage.name}!</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-700">Loading Year {selectedYear} roadmap...</span>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">{currentYearInfo?.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Learning Roadmap
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Year {selectedYear} • {selectedLanguage.name} • {currentYearInfo?.focus}
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
            
            {/* Controls Section - Compact Layout */}
            <div className="flex flex-col gap-4">
              {/* Year and Language Selectors Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Year Selector */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
                    Academic Year
                  </label>
                  <div className="relative">
                    <select
                      id="year-select"
                      value={selectedYear}
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                      disabled={isUpdating || isLoading}
                      className="appearance-none w-48 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white pr-10 cursor-pointer"
                    >
                      {yearOptions.map((year) => (
                        <option key={year.value} value={year.value}>
                          {year.icon} {year.label} {year.isRecommended && '⭐'}
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

                {/* Language Selector */}
                <div className="flex flex-col gap-2">
                  <label htmlFor="language-select" className="text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <div className="relative">
                    <select
                      id="language-select"
                      value={selectedLanguage.id}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      disabled={isUpdating || isLoading}
                      className="appearance-none w-48 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 bg-white pr-10 cursor-pointer"
                    >
                      {languages.map((language) => (
                        <option key={language.id} value={language.id}>
                          {language.icon} {language.name}
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
              </div>

              {/* Compact Tutorial Progress */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Tutorial Progress
                </label>
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <span className="text-yellow-500">🎬</span>
                      Watch Tutorials
                    </h3>
                    <span className="text-xs text-gray-500">0% Overall</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {/* Python Basics */}
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-sm mx-auto mb-1">
                        🐍
                      </div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Basics</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '0%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">0%</div>
                    </div>

                    {/* Data Structures */}
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm mx-auto mb-1">
                        📊
                      </div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Data</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: '0%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">0%</div>
                    </div>

                    {/* Algorithms */}
                    <div className="text-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-sm mx-auto mb-1">
                        ⚡
                      </div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Algos</div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" style={{ width: '0%' }}></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">0%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Year Navigation Tabs */}
          <div className="mt-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {yearOptions.map((year) => (
                <button
                  key={year.value}
                  onClick={() => handleYearChange(year.value)}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                    selectedYear === year.value
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  } ${
                    year.isRecommended ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
                  } relative`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>{year.icon}</span>
                    <span className="hidden sm:inline">{year.label}</span>
                    <span className="sm:hidden">Year {year.value}</span>
                    {year.isRecommended && (
                      <span className="text-yellow-500 text-xs">⭐</span>
                    )}
                  </div>
                  {year.progress > 0 && (
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-16 bg-gray-200 rounded-full h-1">
                      <div 
                        className="bg-green-500 h-1 rounded-full"
                        style={{ width: `${year.progress}%` }}
                      ></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Year Information Card */}
          <div className="mt-6 p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-2xl text-white">
                {currentYearInfo?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="text-xl font-bold text-gray-900">
                    {currentYearInfo?.title}
                  </h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                    Year {selectedYear}
                  </span>
                  {selectedYear === studentCurrentYear && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                      ⭐ Your Current Year
                    </span>
                  )}
                  {selectedYear < studentCurrentYear && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                      ✓ Review Year
                    </span>
                  )}
                  {selectedYear > studentCurrentYear && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                      🔮 Future Year
                    </span>
                  )}
                </div>
                <p className="text-gray-700 mb-4">
                  {currentYearInfo?.description}
                </p>
                <div className="flex flex-wrap gap-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg border border-blue-200">
                    <span>🎯</span>
                    Focus: {currentYearInfo?.focus}
                  </div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-700 text-sm font-medium rounded-lg border border-gray-200">
                    <span>📋</span>
                    Prerequisites: {currentYearInfo?.prerequisites}
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
          progress={normalizedProgress}
          currentYear={selectedYear}
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