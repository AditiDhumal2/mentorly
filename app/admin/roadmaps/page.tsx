// app/admin/roadmap/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Language, languages } from '@/lib/languages';
import { 
  getRoadmapAction, 
  getAllRoadmapsAction,
  createRoadmapStepAction,
  updateRoadmapStepAction,
  deleteRoadmapStepAction,
  reorderRoadmapStepsAction,
  type RoadmapStep,
} from '@/actions/admin-roadmap';
import RoadmapControls from './components/RoadmapControls';
import RoadmapInfo from './components/RoadmapInfo';
import StepCard from './components/StepCard';
import StepFormModal from './components/StepFormModal';
import QuickActionsSection from './components/QuickActionsSection';

export default function AdminRoadmapPage() {
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('python');
  const [roadmap, setRoadmap] = useState<any>(null);
  const [steps, setSteps] = useState<RoadmapStep[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStep, setEditingStep] = useState<RoadmapStep | null>(null);
  const [showStepForm, setShowStepForm] = useState(false);

  useEffect(() => {
    loadRoadmap();
  }, [selectedYear, selectedLanguage]);

  const loadRoadmap = async () => {
    setIsLoading(true);
    try {
      const result = await getRoadmapAction(selectedYear, selectedLanguage);
      if (result.success && result.data) {
        setRoadmap(result.data);
        setSteps(result.data.steps || []);
        // ✅ REMOVED: setQuickActions - not needed anymore
      } else {
        setRoadmap(null);
        setSteps([]);
        // ✅ REMOVED: setQuickActions - not needed anymore
      }
    } catch (error) {
      console.error('Error loading roadmap:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStep = async (stepData: Omit<RoadmapStep, '_id'>) => {
    const result = await createRoadmapStepAction(stepData);
    if (result.success) {
      await loadRoadmap();
      setShowStepForm(false);
    }
    return result;
  };

  const handleUpdateStep = async (stepId: string, stepData: Partial<RoadmapStep>) => {
    const result = await updateRoadmapStepAction(stepId, stepData);
    if (result.success) {
      await loadRoadmap();
      setEditingStep(null);
    }
    return result;
  };

  const handleDeleteStep = async (stepId: string) => {
    if (confirm('Are you sure you want to delete this step?')) {
      const result = await deleteRoadmapStepAction(stepId);
      if (result.success) {
        await loadRoadmap();
      }
    }
  };

  const handleReorderSteps = async (newOrder: string[]) => {
    if (!roadmap?._id) return;
    const result = await reorderRoadmapStepsAction(roadmap._id, newOrder);
    if (result.success) {
      await loadRoadmap();
    }
  };

  // ✅ REMOVED: All quick action handler functions

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Roadmap Management</h1>
          <p className="text-gray-600 mt-2">
            Manage learning roadmaps for different years and programming languages
          </p>
        </div>

        {/* Controls */}
        <RoadmapControls
          selectedYear={selectedYear}
          selectedLanguage={selectedLanguage}
          onYearChange={setSelectedYear}
          onLanguageChange={setSelectedLanguage}
          onAddStep={() => setShowStepForm(true)}
          languages={languages}
        />

        {/* Roadmap Info */}
        {roadmap && (
          <RoadmapInfo 
            roadmap={roadmap} 
            selectedLanguage={selectedLanguage}
            languages={languages}
          />
        )}

        {/* Quick Actions Section - ✅ FIXED: No props needed */}
        <QuickActionsSection />

        {/* Steps List */}
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Learning Steps</h2>
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {steps.length} {steps.length === 1 ? 'step' : 'steps'}
            </span>
          </div>

          {steps.map((step, index) => (
            <StepCard
              key={step._id}
              step={step}
              index={index}
              onEdit={setEditingStep}
              onDelete={handleDeleteStep}
              onUpdate={handleUpdateStep}
            />
          ))}

          {steps.length === 0 && !isLoading && (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300">
              <div className="max-w-md mx-auto">
                <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                  <svg fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No steps created yet</h3>
                <p className="text-gray-500 mb-4">
                  Get started by creating the first learning step for this roadmap.
                </p>
                <button
                  onClick={() => setShowStepForm(true)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                >
                  Create First Step
                </button>
              </div>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading roadmap...</p>
            </div>
          )}
        </div>

        {/* Step Form Modal */}
        {(showStepForm || editingStep) && (
          <StepFormModal
            step={editingStep}
            currentYear={selectedYear}
            currentLanguage={selectedLanguage}
            onSubmit={editingStep ? 
              (data) => handleUpdateStep(editingStep._id!, data) : 
              handleCreateStep
            }
            onClose={() => {
              setShowStepForm(false);
              setEditingStep(null);
            }}
          />
        )}
      </div>
    </div>
  );
}