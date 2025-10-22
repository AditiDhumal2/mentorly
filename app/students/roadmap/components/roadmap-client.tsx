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
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right duration-500">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl border border-green-300/30 flex items-center gap-3 backdrop-blur-sm">
            <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Switched to {selectedLanguage.name}!</span>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-sm mx-4">
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div>
                <div className="font-semibold text-gray-900">Loading Roadmap</div>
                <div className="text-sm text-gray-600">Year {selectedYear} • {selectedLanguage.name}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Left Content */}
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                  <span className="text-2xl">{currentYearInfo?.icon}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">Learning Roadmap</h1>
                  <p className="text-blue-100 text-lg">
                    {selectedLanguage.name} • {currentYearInfo?.focus}
                  </p>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="px-3 py-1 bg-white/20 rounded-full text-sm backdrop-blur-sm">
                      Year {selectedYear}
                    </span>
                    {selectedYear === studentCurrentYear && (
                      <span className="px-3 py-1 bg-yellow-400 text-blue-900 rounded-full text-sm font-medium">
                        ⭐ Current Year
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Enhanced Progress Stats */}
              {safeProgressStats && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: "Steps", value: `${safeProgressStats.completedSteps}/${safeProgressStats.totalSteps}`, color: "from-blue-400 to-cyan-400", icon: "📝" },
                    { label: "Progress", value: `${safeProgressStats.completionRate}%`, color: "from-green-400 to-emerald-400", icon: "📈" },
                    { label: "Time", value: formatTime(safeProgressStats.totalTimeSpent), color: "from-purple-400 to-pink-400", icon: "⏱️" },
                    { label: "Streak", value: `${safeProgressStats.currentStreak} days`, color: "from-orange-400 to-red-400", icon: "🔥" },
                    { label: "Resources", value: safeProgressStats.resourcesViewed, color: "from-indigo-400 to-blue-400", icon: "📚" },
                    { label: "Engagement", value: `${safeProgressStats.averageEngagement}%`, color: "from-teal-400 to-green-400", icon: "🎯" }
                  ].map((stat, index) => (
                    <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm">{stat.icon}</span>
                        <div className="text-xs text-blue-100 opacity-90">{stat.label}</div>
                      </div>
                      <div className={`text-lg font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Controls Section */}
            <div className="flex flex-col gap-4 min-w-[300px]">
              {/* Year & Language Selectors */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="space-y-4">
                  {/* Year Selector */}
                  <div>
                    <label className="text-blue-100 text-sm font-medium mb-2 block">Academic Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    >
                      {yearOptions.map((year) => (
                        <option key={year.value} value={year.value} className="text-gray-900">
                          {year.icon} {year.label} {year.isRecommended && '⭐'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Language Selector */}
                  <div>
                    <label className="text-blue-100 text-sm font-medium mb-2 block">Programming Language</label>
                    <select
                      value={selectedLanguage.id}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
                    >
                      {languages.map((language) => (
                        <option key={language.id} value={language.id} className="text-gray-900">
                          {language.icon} {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Quick Progress */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <span>🎬</span> Learning Progress
                </h3>
                <div className="space-y-3">
                  {[
                    { name: "Python Basics", progress: 0, color: "from-green-400 to-emerald-400", icon: "🐍" },
                    { name: "Data Structures", progress: 0, color: "from-blue-400 to-cyan-400", icon: "📊" },
                    { name: "Algorithms", progress: 0, color: "from-purple-400 to-pink-400", icon: "⚡" }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r rounded-lg flex items-center justify-center text-white text-sm">
                        {item.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs text-blue-100 mb-1">
                          <span>{item.name}</span>
                          <span>{item.progress}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${item.color}`}
                            style={{ width: `${item.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year Navigation */}
      <div className="container mx-auto px-4 -mt-6 relative z-10">
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 inline-flex">
            {yearOptions.map((year) => (
              <button
                key={year.value}
                onClick={() => handleYearChange(year.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  selectedYear === year.value
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                } relative min-w-[140px]`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{year.icon}</span>
                  <div className="text-left">
                    <div className="text-sm font-semibold">Year {year.value}</div>
                    <div className="text-xs opacity-80">{year.label.split(' - ')[1]}</div>
                  </div>
                  {year.isRecommended && (
                    <span className="absolute -top-1 -right-1 text-yellow-400 text-sm">⭐</span>
                  )}
                </div>
                {year.progress > 0 && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-20 bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
                      style={{ width: `${year.progress}%` }}
                    ></div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Year Information */}
      <div className="container mx-auto px-4 mt-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg">
                  {currentYearInfo?.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">{currentYearInfo?.title}</h2>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                      🎓 Year {selectedYear}
                    </span>
                    {selectedYear === studentCurrentYear && (
                      <span className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        ⭐ Your Current Focus
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-700 text-lg leading-relaxed mb-6">
                  {currentYearInfo?.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">🎯</span>
                      <div>
                        <div className="font-semibold text-gray-900">Focus Area</div>
                        <div className="text-gray-600 text-sm">{currentYearInfo?.focus}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-2xl">📋</span>
                      <div>
                        <div className="font-semibold text-gray-900">Prerequisites</div>
                        <div className="text-gray-600 text-sm">{currentYearInfo?.prerequisites}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {safeProgressStats && (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                          <span className="text-2xl">⏱️</span>
                          <div>
                            <div className="font-semibold text-gray-900">Time Invested</div>
                            <div className="text-gray-600 text-sm">{formatTime(safeProgressStats.totalTimeSpent)}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                          <span className="text-2xl">🔥</span>
                          <div>
                            <div className="font-semibold text-gray-900">Learning Streak</div>
                            <div className="text-gray-600 text-sm">{safeProgressStats.currentStreak} days active</div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
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