// app/admin/roadmaps/page.tsx
import { Language, languages } from '@/lib/languages';
import { getRoadmapAction } from '@/actions/admin-roadmap';
import QuickActionsSection from './components/QuickActionsSection';
import { RoadmapStep } from '@/types/admin-roadmap';

interface SearchParams {
  year?: string;
  language?: string;
  edit?: string;
  create?: string;
}

interface AdminRoadmapPageProps {
  searchParams: Promise<SearchParams>;
}

// Define resource types
interface BaseResource {
  title?: string;
  url?: string;
  type?: string;
}

// Extended RoadmapStep interface
interface ExtendedRoadmapStep extends Omit<RoadmapStep, 'resources'> {
  completed?: boolean;
  learningOutcomes?: string[];
  resources: (string | BaseResource)[];
}

// Helper function to safely cast steps
function safeCastSteps(steps: any[]): ExtendedRoadmapStep[] {
  return steps.map(step => ({
    ...step,
    year: step.year || 1,
    _id: step._id?.toString() || step._id,
    estimatedDuration: step.estimatedDuration || step.duration || '',
    languageSpecific: step.languageSpecific || false,
    completed: step.completed || false,
    resources: step.resources || [],
    prerequisites: step.prerequisites || [],
    learningOutcomes: step.learningOutcomes || [],
    priority: step.priority || 2,
    order: step.order || 0
  })) as ExtendedRoadmapStep[];
}

// Helper function to safely get resource display text
function getResourceDisplay(resource: string | BaseResource): string {
  if (typeof resource === 'string') {
    return resource;
  }
  return resource.title || resource.url || 'Resource';
}

export default async function AdminRoadmapPage({ searchParams }: AdminRoadmapPageProps) {
  // ✅ FIX: Await the searchParams Promise
  const params = await searchParams;
  const selectedYear = parseInt(params.year || '1');
  const selectedLanguage = params.language || 'python';
  const editingStepId = params.edit;
  const showCreateForm = params.create === 'true';

  // Load roadmap data on the server
  const result = await getRoadmapAction(selectedYear, selectedLanguage);
  const roadmap = result.success ? result.data : null;
  const rawSteps = roadmap?.steps || [];
  const steps: ExtendedRoadmapStep[] = safeCastSteps(rawSteps);

  // Find the current language
  const currentLanguage = languages.find(lang => lang.id === selectedLanguage);

  // Calculate stats - use the completed property
  const completedSteps = steps.filter(step => step.completed).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="relative bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl shadow-xl overflow-hidden p-8">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm border border-white/30">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🗺️</span>
                    </div>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                      Roadmap Management
                    </h1>
                    <p className="text-purple-100 text-lg font-medium">
                      Manage learning roadmaps for different years and programming languages
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 sm:mt-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                    <div className="text-white text-sm font-medium mb-1">Current Selection</div>
                    <div className="text-white font-bold text-lg">
                      Year {selectedYear} • {currentLanguage?.name || selectedLanguage}
                    </div>
                    <div className="text-purple-100 text-sm">
                      {steps.length} {steps.length === 1 ? 'step' : 'steps'} configured
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-purple-100 hover:shadow-xl transition-shadow">
            <div className="text-purple-600 font-bold text-2xl mb-2">
              {steps.length}
            </div>
            <div className="text-purple-700 font-semibold text-sm">Learning Steps</div>
            <div className="text-purple-400 text-xs mt-1">In this roadmap</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-pink-100 hover:shadow-xl transition-shadow">
            <div className="text-pink-600 font-bold text-2xl mb-2">
              {completedSteps}
            </div>
            <div className="text-pink-700 font-semibold text-sm">Completed Steps</div>
            <div className="text-pink-400 text-xs mt-1">Ready to publish</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-fuchsia-100 hover:shadow-xl transition-shadow">
            <div className="text-fuchsia-600 font-bold text-2xl mb-2">
              {languages.length}
            </div>
            <div className="text-fuchsia-700 font-semibold text-sm">Languages</div>
            <div className="text-fuchsia-400 text-xs mt-1">Supported</div>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-lg border border-rose-100 hover:shadow-xl transition-shadow">
            <div className="text-rose-600 font-bold text-2xl mb-2">
              4
            </div>
            <div className="text-rose-700 font-semibold text-sm">Academic Years</div>
            <div className="text-rose-400 text-xs mt-1">Available</div>
          </div>
        </div>

        {/* Quick Actions Section */}
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
            <div key={step._id?.toString() || `step-${index}`} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-700 rounded-lg font-semibold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                    {step.completed && (
                      <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{step.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                      {step.category}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                      Priority: {step.priority === 1 ? 'Low' : step.priority === 2 ? 'Medium' : 'High'}
                    </span>
                    {step.estimatedDuration && (
                      <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        {step.estimatedDuration}
                      </span>
                    )}
                  </div>

                  {step.resources && step.resources.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Resources:</h4>
                      <div className="flex flex-wrap gap-1">
                        {step.resources.map((resource, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {getResourceDisplay(resource)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Prerequisites:</h4>
                      <div className="flex flex-wrap gap-1">
                        {step.prerequisites.map((prereq, idx) => (
                          <span key={idx} className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded">
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {step.learningOutcomes && step.learningOutcomes.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Learning Outcomes:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {step.learningOutcomes.map((outcome: string, idx: number) => (
                          <li key={idx}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <a
                    href={`?year=${selectedYear}&language=${selectedLanguage}&edit=${step._id}`}
                    className="inline-flex items-center px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </a>
                  <form action="/api/roadmap/steps/delete" method="POST" className="inline">
                    <input type="hidden" name="stepId" value={step._id?.toString() || ''} />
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))}

          {steps.length === 0 && (
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
                <a
                  href={`?year=${selectedYear}&language=${selectedLanguage}&create=true`}
                  className="inline-block px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                >
                  Create First Step
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Step Form Modal */}
        {(showCreateForm || editingStepId) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingStepId ? 'Edit Step' : 'Create New Step'}
                  </h2>
                  <a
                    href={`?year=${selectedYear}&language=${selectedLanguage}`}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </a>
                </div>
                
                <form action="/api/roadmap/steps" method="POST" className="space-y-4">
                  {/* Hidden fields for current context */}
                  <input type="hidden" name="year" value={selectedYear} />
                  <input type="hidden" name="language" value={selectedLanguage} />
                  {editingStepId && (
                    <input type="hidden" name="stepId" value={editingStepId} />
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Step Title *
                      </label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        required
                        defaultValue={steps.find(step => step._id === editingStepId)?.title || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter step title"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        id="category"
                        name="category"
                        required
                        defaultValue={steps.find(step => step._id === editingStepId)?.category || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select Category</option>
                        <option value="fundamentals">Fundamentals</option>
                        <option value="advanced">Advanced</option>
                        <option value="projects">Projects</option>
                        <option value="practice">Practice</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      required
                      rows={3}
                      defaultValue={steps.find(step => step._id === editingStepId)?.description || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe what students will learn in this step"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="estimatedDuration" className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Duration
                      </label>
                      <input
                        type="text"
                        id="estimatedDuration"
                        name="estimatedDuration"
                        defaultValue={steps.find(step => step._id === editingStepId)?.estimatedDuration || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="e.g., 2 weeks, 1 month"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        defaultValue={steps.find(step => step._id === editingStepId)?.priority || 2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value={1}>Low</option>
                        <option value={2}>Medium</option>
                        <option value={3}>High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="resources" className="block text-sm font-medium text-gray-700 mb-1">
                      Resources (one per line)
                    </label>
                    <textarea
                      id="resources"
                      name="resources"
                      rows={3}
                      defaultValue={steps.find(step => step._id === editingStepId)?.resources?.map(getResourceDisplay).join('\n') || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter resources, one per line"
                    />
                  </div>

                  <div>
                    <label htmlFor="prerequisites" className="block text-sm font-medium text-gray-700 mb-1">
                      Prerequisites (one per line)
                    </label>
                    <textarea
                      id="prerequisites"
                      name="prerequisites"
                      rows={2}
                      defaultValue={steps.find(step => step._id === editingStepId)?.prerequisites?.join('\n') || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter prerequisites, one per line"
                    />
                  </div>

                  <div>
                    <label htmlFor="learningOutcomes" className="block text-sm font-medium text-gray-700 mb-1">
                      Learning Outcomes (one per line)
                    </label>
                    <textarea
                      id="learningOutcomes"
                      name="learningOutcomes"
                      rows={3}
                      defaultValue={steps.find(step => step._id === editingStepId)?.learningOutcomes?.join('\n') || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter learning outcomes, one per line"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="completed"
                      name="completed"
                      defaultChecked={steps.find(step => step._id === editingStepId)?.completed || false}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="completed" className="ml-2 text-sm text-gray-700">
                      Mark as completed
                    </label>
                  </div>
                  
                  <div className="flex justify-end space-x-3 pt-4">
                    <a
                      href={`?year=${selectedYear}&language=${selectedLanguage}`}
                      className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </a>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      {editingStepId ? 'Update Step' : 'Create Step'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}