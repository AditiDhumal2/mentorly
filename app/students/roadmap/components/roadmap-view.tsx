'use client';

import { Language } from '../../../../lib/languages';
import StepCard from './step-card';

interface RoadmapViewProps {
  roadmap: any;
  progress: any;
  currentYear: number;
  userId: string;
  selectedLanguage: Language;
  engagementData: { [key: string]: any };
  onTrackResourceView: (stepId: string, resource: any) => Promise<void>;
  onTrackVideoProgress: (stepId: string, timeSpent: number) => Promise<void>;
  onTrackQuizCompletion: (stepId: string, score: number) => Promise<void>;
  onManualComplete: (stepId: string) => Promise<void>;
  onRefreshProgress: () => Promise<void>;
}

export default function RoadmapView({
  roadmap,
  progress,
  currentYear,
  userId,
  selectedLanguage,
  engagementData,
  onTrackResourceView,
  onTrackVideoProgress,
  onTrackQuizCompletion,
  onManualComplete,
  onRefreshProgress
}: RoadmapViewProps) {
  
  // Safe progress data handling
  const getSafeProgressArray = () => {
    if (!progress) return [];
    
    // Handle different progress data structures
    if (Array.isArray(progress)) {
      return progress;
    } else if (progress && typeof progress === 'object') {
      // If progress is an object with a progress array
      if (Array.isArray(progress.progress)) {
        return progress.progress;
      }
      // If progress is an object with steps array
      else if (Array.isArray(progress.steps)) {
        return progress.steps;
      }
      // If it's an object with completion data
      else if (progress.completedSteps !== undefined) {
        // Convert to array format if needed
        return Object.keys(progress).map(key => ({
          stepId: key,
          completed: progress[key].completed || false
        }));
      }
    }
    
    return [];
  };

  const getProgressForStep = (stepId: string) => {
    const safeProgress = getSafeProgressArray();
    return safeProgress.find((p: any) => p.stepId === stepId);
  };

  // Show warning if using fallback roadmap
  const isFallback = roadmap.isFallback;
  const requestedLanguage = roadmap.requestedLanguage;

  // Calculate overall progress statistics safely
  const totalSteps = roadmap.steps?.length || 0;
  const safeProgress = getSafeProgressArray();
  const completedSteps = safeProgress.filter((p: any) => p.completed).length;
  const completionRate = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Calculate average engagement safely
  const engagementValues = Object.values(engagementData);
  const totalEngagement = engagementValues.reduce((sum: number, data: any) => 
    sum + (data.engagementScore || 0), 0);
  const averageEngagement = engagementValues.length > 0 
    ? Math.round(totalEngagement / engagementValues.length) 
    : 0;

  // Count auto-completed steps
  const autoCompletedSteps = engagementValues.filter((data: any) => data.autoCompleted).length;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Roadmap Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 shadow-sm mb-4">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-sm font-medium text-gray-600">
            Year {currentYear} Roadmap • {selectedLanguage.name}
            {isFallback && ` (Showing default content)`}
          </span>
        </div>
        
        {isFallback && requestedLanguage && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              <strong>Note:</strong> Specific roadmap for {requestedLanguage} is being prepared. 
              Currently showing default content.
            </p>
          </div>
        )}
        
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          {roadmap.title}
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {roadmap.description}
        </p>
      </div>

      {/* Enhanced Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Steps</p>
              <p className="text-2xl font-bold text-gray-900">{totalSteps}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">
                {completedSteps}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {completionRate}% Complete
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Focus Language</p>
              <p className="text-xl font-bold text-gray-900">{selectedLanguage.name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔥</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Engagement</p>
              <p className="text-2xl font-bold text-gray-900">
                {averageEngagement}%
              </p>
              <p className="text-xs text-orange-600 mt-1">
                {autoCompletedSteps} auto-completed
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Visualization */}
      {totalSteps > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
            <span className="text-sm text-gray-600">{completionRate}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div 
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600 mt-2">
            <span>{completedSteps} of {totalSteps} steps completed</span>
            <span>{autoCompletedSteps} auto-completed</span>
          </div>
        </div>
      )}

      {/* Roadmap Steps */}
      <div className="space-y-6">
        {roadmap.steps?.map((step: any, index: number) => {
          const stepProgress = getProgressForStep(step._id);
          const stepEngagement = engagementData[step._id] || {
            engagementScore: 0,
            timeSpent: 0,
            resourcesViewed: 0,
            completed: false,
            autoCompleted: false,
            progressPercentage: 0
          };
          
          const isCompleted = stepProgress?.completed || stepEngagement.completed || false;
          
          // Create a unique key
          const stepKey = step._id || `step-${selectedLanguage.id}-${currentYear}-${index}`;
          
          return (
            <StepCard
              key={stepKey}
              step={step}
              index={index}
              isCompleted={isCompleted}
              userId={userId}
              engagementData={stepEngagement}
              onTrackResourceView={onTrackResourceView}
              onTrackVideoProgress={onTrackVideoProgress}
              onTrackQuizCompletion={onTrackQuizCompletion}
              onManualComplete={onManualComplete}
            />
          );
        })}
      </div>

      {/* Empty State */}
      {(!roadmap.steps || roadmap.steps.length === 0) && (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">No Steps Available</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            The roadmap for {selectedLanguage.name} in Year {currentYear} is being prepared. Check back soon!
          </p>
        </div>
      )}

      {/* Quick Actions Footer */}
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Progress Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span>📺</span>
            </div>
            <span className="text-gray-700">Watch video tutorials to boost engagement</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <span>📚</span>
            </div>
            <span className="text-gray-700">Read all resources for better understanding</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <span>⚡</span>
            </div>
            <span className="text-gray-700">Practice coding to auto-complete steps</span>
          </div>
        </div>
      </div>
    </div>
  );
}