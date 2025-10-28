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

const YEAR_DESCRIPTIONS = {
  1: {
    title: "Foundation Year - Programming Fundamentals",
    description: "Learn basic programming concepts, algorithms, and problem-solving skills.",
    focus: "Basic syntax, data structures, algorithms, and logical thinking",
    icon: "🌱",
    prerequisites: "No prior programming experience required"
  },
  2: {
    title: "Skill Development - Advanced Concepts", 
    description: "Dive deeper into programming concepts and build complex applications.",
    focus: "OOP, databases, APIs, frameworks, and intermediate projects",
    icon: "🚀",
    prerequisites: "Complete Year 1 fundamentals or equivalent knowledge"
  },
  3: {
    title: "Specialization - Domain Expertise",
    description: "Focus on specific domains like web development, mobile apps, or data science.",
    focus: "Advanced frameworks, specialized tools, and real-world projects",
    icon: "🎯",
    prerequisites: "Strong grasp of Year 2 concepts"
  },
  4: {
    title: "Placement Preparation - Career Ready",
    description: "Prepare for interviews, build an impressive portfolio, and master advanced concepts.",
    focus: "System design, interview prep, portfolio development, and soft skills",
    icon: "🏆",
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

  const normalizeProgress = (progressData: any): any[] => {
    if (!progressData) return [];
    
    if (Array.isArray(progressData)) {
      return progressData;
    } else if (progressData && typeof progressData === 'object') {
      if (Array.isArray(progressData.progress)) {
        return progressData.progress;
      } else if (Array.isArray(progressData.steps)) {
        return progressData.steps;
      } else if (progressData.completedSteps !== undefined) {
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
      const result = await updatePreferredLanguageAction(userId, languageId);
      
      if (result.success) {
        setSelectedLanguage(newLanguage);
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 3000);
        
        const [newRoadmapResult, newProgressResult] = await Promise.all([
          getRoadmapAction(selectedYear, languageId),
          getRoadmapProgressAction(userId, languageId)
        ]);
        
        if (newRoadmapResult.success && newRoadmapResult.data) {
          const updatedRoadmap = updateRoadmapForYear(newRoadmapResult.data, selectedYear);
          setRoadmap(updatedRoadmap);
        }
        
        if (newProgressResult.success && newProgressResult.data) {
          const normalizedProgress = normalizeProgress(newProgressResult.data);
          setProgress(normalizedProgress);
        } else {
          setProgress([]);
        }
        
        await loadProgressStats();
        await loadEngagementData();
        
      } else {
        console.error('Failed to update language:', result.error);
        setProgress([]);
      }
    } catch (error) {
      console.error('Error updating language:', error);
      setProgress([]);
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

  const updateRoadmapForYear = (baseRoadmap: any, year: number) => {
    const yearInfo = YEAR_DESCRIPTIONS[year as keyof typeof YEAR_DESCRIPTIONS];
    
    return {
      ...baseRoadmap,
      title: yearInfo?.title || baseRoadmap.title,
      description: yearInfo?.description || baseRoadmap.description,
      year: year,
      steps: baseRoadmap.steps?.map((step: any) => ({
        ...step,
        yearContext: `Year ${year} - ${yearInfo?.focus}`
      })) || []
    };
  };

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
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg">
          Switched to {selectedLanguage.name}!
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <div>Loading Roadmap...</div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">{currentYearInfo?.icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Learning Roadmap</h1>
                  <p className="text-blue-100">
                    {selectedLanguage.name} • {currentYearInfo?.focus}
                  </p>
                </div>
              </div>

              {/* Progress Stats */}
              {safeProgressStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-blue-100">Progress</div>
                    <div className="text-lg font-bold text-white">{safeProgressStats.completionRate}%</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-blue-100">Steps</div>
                    <div className="text-lg font-bold text-white">{safeProgressStats.completedSteps}/{safeProgressStats.totalSteps}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-blue-100">Time</div>
                    <div className="text-lg font-bold text-white">{formatTime(safeProgressStats.totalTimeSpent)}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <div className="text-sm text-blue-100">Streak</div>
                    <div className="text-lg font-bold text-white">{safeProgressStats.currentStreak}d</div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Controls */}
            <div className="flex flex-col gap-4 w-full lg:w-64">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="space-y-4">
                  <div>
                    <label className="text-blue-100 text-sm mb-2">Academic Year</label>
                    <select
                      value={selectedYear}
                      onChange={(e) => handleYearChange(Number(e.target.value))}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                    >
                      {yearOptions.map((year) => (
                        <option key={year.value} value={year.value} className="text-gray-900">
                          {year.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-blue-100 text-sm mb-2">Language</label>
                    <select
                      value={selectedLanguage.id}
                      onChange={(e) => handleLanguageChange(e.target.value)}
                      className="w-full p-2 bg-white/10 border border-white/20 rounded text-white"
                    >
                      {languages.map((language) => (
                        <option key={language.id} value={language.id} className="text-gray-900">
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Year Navigation */}
      <div className="container mx-auto px-4 -mt-4">
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-sm border p-2 flex gap-2">
            {yearOptions.map((year) => (
              <button
                key={year.value}
                onClick={() => handleYearChange(year.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedYear === year.value
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Year {year.value}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Year Information */}
      <div className="container mx-auto px-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center text-2xl text-white">
              {currentYearInfo?.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-900">{currentYearInfo?.title}</h2>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Year {selectedYear}
                </span>
              </div>
              
              <p className="text-gray-600 mb-6">
                {currentYearInfo?.description}
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🎯</span>
                    <div>
                      <div className="font-semibold text-gray-900">Focus Area</div>
                      <div className="text-gray-600 text-sm">{currentYearInfo?.focus}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <span className="text-xl">📋</span>
                    <div>
                      <div className="font-semibold text-gray-900">Prerequisites</div>
                      <div className="text-gray-600 text-sm">{currentYearInfo?.prerequisites}</div>
                    </div>
                  </div>
                </div>
                
                {safeProgressStats && (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <span className="text-xl">⏱️</span>
                      <div>
                        <div className="font-semibold text-gray-900">Time Invested</div>
                        <div className="text-gray-600 text-sm">{formatTime(safeProgressStats.totalTimeSpent)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <span className="text-xl">🔥</span>
                      <div>
                        <div className="font-semibold text-gray-900">Learning Streak</div>
                        <div className="text-gray-600 text-sm">{safeProgressStats.currentStreak} days</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Roadmap Content */}
      <div className="container mx-auto px-4 py-6">
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