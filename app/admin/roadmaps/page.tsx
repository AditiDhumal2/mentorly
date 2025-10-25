// app/admin/roadmap/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Language, languages } from '@/lib/languages';
import { 
  getRoadmapAction, 
  createRoadmapStepAction,
  updateRoadmapStepAction,
  deleteRoadmapStepAction,
  reorderRoadmapStepsAction
} from '@/actions/admin-roadmap-actions';

interface RoadmapStep {
  _id?: string;
  title: string;
  description: string;
  category: string;
  priority: number;
  estimatedDuration: string;
  languageSpecific: boolean;
  resources: Resource[];
  prerequisites: string[];
  year: number;
  language: string;
}

interface Resource {
  _id?: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'documentation' | 'exercise' | 'quiz';
  description?: string;
  duration?: string;
}

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
      } else {
        setRoadmap(null);
        setSteps([]);
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
    const result = await reorderRoadmapStepsAction(roadmap._id, newOrder);
    if (result.success) {
      await loadRoadmap();
    }
  };

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
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4].map(year => (
                  <option key={year} value={year}>Year {year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Programming Language
              </label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(language => (
                  <option key={language.id} value={language.id}>
                    {language.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowStepForm(true)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add New Step
              </button>
            </div>
          </div>
        </div>

        {/* Roadmap Info */}
        {roadmap && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {roadmap.title} - {languages.find(l => l.id === selectedLanguage)?.name}
            </h2>
            <p className="text-gray-600">{roadmap.description}</p>
          </div>
        )}

        {/* Steps List */}
        <div className="space-y-4">
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
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500 text-lg">No steps found for this roadmap.</p>
              <button
                onClick={() => setShowStepForm(true)}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Create First Step
              </button>
            </div>
          )}
        </div>

        {/* Step Form Modal */}
        {(showStepForm || editingStep) && (
          <StepFormModal
            step={editingStep}
            year={selectedYear}
            language={selectedLanguage}
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

// Step Card Component
interface StepCardProps {
  step: RoadmapStep;
  index: number;
  onEdit: (step: RoadmapStep) => void;
  onDelete: (stepId: string) => void;
  onUpdate: (stepId: string, data: Partial<RoadmapStep>) => Promise<any>;
}

function StepCard({ step, index, onEdit, onDelete, onUpdate }: StepCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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
              onClick={() => step._id && onDelete(step._id)}
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

// Step Form Modal Component
interface StepFormModalProps {
  step?: RoadmapStep | null;
  year: number;
  language: string;
  onSubmit: (data: any) => Promise<any>;
  onClose: () => void;
}

function StepFormModal({ step, year, language, onSubmit, onClose }: StepFormModalProps) {
  const [formData, setFormData] = useState({
    title: step?.title || '',
    description: step?.description || '',
    category: step?.category || 'fundamentals',
    priority: step?.priority || 2,
    estimatedDuration: step?.estimatedDuration || '1-2 hours',
    languageSpecific: step?.languageSpecific || false,
    resources: step?.resources || [],
    prerequisites: step?.prerequisites || [],
    year: step?.year || year,
    language: step?.language || language
  });

  const [newResource, setNewResource] = useState({
    title: '',
    url: '',
    type: 'video' as const,
    description: '',
    duration: ''
  });

  const [newPrerequisite, setNewPrerequisite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        alert(result.error || 'Failed to save step');
      }
    } catch (error) {
      alert('Error saving step');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addResource = () => {
    if (newResource.title && newResource.url) {
      setFormData(prev => ({
        ...prev,
        resources: [...prev.resources, { ...newResource }]
      }));
      setNewResource({
        title: '',
        url: '',
        type: 'video',
        description: '',
        duration: ''
      });
    }
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const addPrerequisite = () => {
    if (newPrerequisite.trim()) {
      setFormData(prev => ({
        ...prev,
        prerequisites: [...prev.prerequisites, newPrerequisite.trim()]
      }));
      setNewPrerequisite('');
    }
  };

  const removePrerequisite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {step ? 'Edit Step' : 'Create New Step'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Step Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter step title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="fundamentals">Fundamentals</option>
                  <option value="syntax">Syntax</option>
                  <option value="concepts">Concepts</option>
                  <option value="projects">Projects</option>
                  <option value="practice">Practice</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter step description"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>High</option>
                  <option value={2}>Medium</option>
                  <option value={3}>Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Duration
                </label>
                <select
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30 minutes">30 minutes</option>
                  <option value="1 hour">1 hour</option>
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="2-3 hours">2-3 hours</option>
                  <option value="3-4 hours">3-4 hours</option>
                  <option value="4+ hours">4+ hours</option>
                </select>
              </div>

              <div className="flex items-center">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.languageSpecific}
                    onChange={(e) => setFormData(prev => ({ ...prev, languageSpecific: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Language Specific</span>
                </label>
              </div>
            </div>

            {/* Resources Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Learning Resources
              </label>
              
              <div className="space-y-4 mb-4">
                {formData.resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <span className="font-medium">{resource.title}</span>
                        <span className="text-sm text-gray-500 capitalize">({resource.type})</span>
                        <a 
                          href={resource.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          View
                        </a>
                      </div>
                      {resource.description && (
                        <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeResource(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Resource Form */}
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <h4 className="font-medium text-gray-900">Add New Resource</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newResource.title}
                    onChange={(e) => setNewResource(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Resource Title"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <select
                    value={newResource.type}
                    onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value as any }))}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                    <option value="documentation">Documentation</option>
                    <option value="exercise">Exercise</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <input
                  type="url"
                  value={newResource.url}
                  onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="Resource URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newResource.description}
                    onChange={(e) => setNewResource(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description (optional)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  
                  <input
                    type="text"
                    value={newResource.duration}
                    onChange={(e) => setNewResource(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="Duration (e.g., 30min)"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={addResource}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Add Resource
                </button>
              </div>
            </div>

            {/* Prerequisites */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Prerequisites
              </label>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.prerequisites.map((prereq, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {prereq}
                    <button
                      type="button"
                      onClick={() => removePrerequisite(index)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newPrerequisite}
                  onChange={(e) => setNewPrerequisite(e.target.value)}
                  placeholder="Add prerequisite"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Saving...' : (step ? 'Update Step' : 'Create Step')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}