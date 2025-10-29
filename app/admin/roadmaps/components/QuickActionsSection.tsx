// app/admin/roadmap/components/QuickActionsSection.tsx
'use client';

import { useState, useEffect } from 'react';

interface QuickActionResource {
  title: string;
  url: string;
  platform?: string;
  description?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  type: 'study' | 'quiz' | 'exercise' | 'video' | 'reading' | 'project';
  duration: string;
  icon: string;
  color: 'blue' | 'purple' | 'green' | 'red' | 'yellow';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  isActive: boolean;
  points: number;
  resourceUrl: string; // ✅ ADDED: Direct link for quick actions
  targetYear: number; // ✅ ADDED: Specific year for this action
  targetLanguage: string; // ✅ ADDED: Specific language for this action
}

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
    resourceUrl: '', // No direct link - tracks time
    targetYear: 0, // 0 means all years
    targetLanguage: 'all' // 'all' means all languages
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
    resourceUrl: 'https://leetcode.com/problemset/',
    targetYear: 0,
    targetLanguage: 'all'
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
    resourceUrl: 'https://github.com/',
    targetYear: 0,
    targetLanguage: 'all'
  }
];

const YEARS = [0, 1, 2, 3, 4]; // 0 means "All Years"
const LANGUAGES = [
  { id: 'all', name: 'All Languages' },
  { id: 'python', name: 'Python' },
  { id: 'javascript', name: 'JavaScript' },
  { id: 'java', name: 'Java' },
  { id: 'cpp', name: 'C++' },
  { id: 'go', name: 'Go' },
  { id: 'rust', name: 'Rust' }
];

const ICON_OPTIONS = [
  { value: '📚', label: '📚 Study' },
  { value: '🧠', label: '🧠 Quiz' },
  { value: '💻', label: '💻 Code' },
  { value: '🎯', label: '🎯 Project' },
  { value: '⚡', label: '⚡ Quick' },
  { value: '📖', label: '📖 Reading' },
  { value: '🎬', label: '🎬 Video' },
  { value: '🔍', label: '🔍 Research' }
];

export default function QuickActionsSection() {
  const [quickActions, setQuickActions] = useState<QuickAction[]>(defaultQuickActions);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editingAction, setEditingAction] = useState<QuickAction | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    // Load saved quick actions from localStorage
    const savedActions = localStorage.getItem('admin-quick-actions');
    if (savedActions) {
      try {
        setQuickActions(JSON.parse(savedActions));
      } catch (error) {
        console.error('Error loading quick actions:', error);
      }
    }
  }, []);

  const saveQuickActions = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('admin-quick-actions', JSON.stringify(quickActions));
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (error) {
      console.error('Error saving quick actions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (action: QuickAction) => {
    setEditingAction({ ...action });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (editingAction) {
      setQuickActions(prev => prev.map(action => 
        action.id === editingAction.id ? editingAction : action
      ));
    }
    setShowEditModal(false);
    setEditingAction(null);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditingAction(null);
  };

  const toggleActive = (id: string) => {
    setQuickActions(prev => prev.map(action => 
      action.id === id ? { ...action, isActive: !action.isActive } : action
    ));
  };

  const resetToDefaults = () => {
    setQuickActions(defaultQuickActions);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      study: 'bg-blue-100 text-blue-800',
      quiz: 'bg-purple-100 text-purple-800',
      exercise: 'bg-green-100 text-green-800',
      video: 'bg-red-100 text-red-800',
      reading: 'bg-yellow-100 text-yellow-800',
      project: 'bg-indigo-100 text-indigo-800'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getColorClasses = (color: string) => {
    const colors: { [key: string]: string } = {
      blue: 'bg-blue-100 text-blue-700 border-blue-200',
      purple: 'bg-purple-100 text-purple-700 border-purple-200',
      green: 'bg-green-100 text-green-700 border-green-200',
      red: 'bg-red-100 text-red-700 border-red-200',
      yellow: 'bg-yellow-100 text-yellow-700 border-yellow-200'
    };
    return colors[color] || colors.blue;
  };

  const getYearLabel = (year: number) => {
    return year === 0 ? 'All Years' : `Year ${year}`;
  };

  const getLanguageLabel = (languageId: string) => {
    const lang = LANGUAGES.find(l => l.id === languageId);
    return lang ? lang.name : languageId;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions Settings
          </h2>
          <p className="text-gray-600 mt-1">
            Customize quick actions with links, target years, and languages
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveQuickActions}
            disabled={isSaving}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50">
          Quick actions saved successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action) => (
          <div
            key={action.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">{action.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <div className="flex gap-1 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(action.type)}`}>
                      {action.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(action.difficulty)}`}>
                      {action.difficulty}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handleEdit(action)}
                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => toggleActive(action.id)}
                  className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {action.isActive ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">{action.description}</p>

            {/* Resource URL Display */}
            {action.resourceUrl && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-1">Links to:</p>
                <a 
                  href={action.resourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-700 break-all"
                >
                  {action.resourceUrl}
                </a>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-500">
              <span className="capitalize">{action.type}</span>
              <span>{action.duration}</span>
            </div>

            {/* Target Information */}
            <div className="mt-2 text-xs text-gray-500">
              <div>For: {getYearLabel(action.targetYear)} • {getLanguageLabel(action.targetLanguage)}</div>
            </div>

            {action.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {action.tags.slice(0, 3).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-1 rounded ${
                  action.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {action.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-gray-500">{action.points} points</span>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-3 p-3 bg-gray-50 rounded border">
              <p className="text-xs text-gray-600 mb-2">Student Preview:</p>
              <button className={`w-full px-3 py-2 rounded border ${getColorClasses(action.color)} text-sm font-medium`}>
                <div className="flex items-center gap-2 justify-center">
                  <span>{action.icon}</span>
                  <span>{action.title}</span>
                </div>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showEditModal && editingAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Quick Action</h2>
                <button
                  onClick={handleCancelEdit}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={editingAction.title}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, title: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Quick action title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Icon *
                    </label>
                    <select
                      value={editingAction.icon}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, icon: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {ICON_OPTIONS.map(icon => (
                        <option key={icon.value} value={icon.value}>
                          {icon.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={editingAction.description}
                    onChange={(e) => setEditingAction(prev => prev ? { ...prev, description: e.target.value } : null)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What students will do..."
                  />
                </div>

                {/* Resource URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resource URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={editingAction.resourceUrl}
                    onChange={(e) => setEditingAction(prev => prev ? { ...prev, resourceUrl: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/resource"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Students will be redirected to this URL when they click the quick action
                  </p>
                </div>

                {/* Target Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Year
                    </label>
                    <select
                      value={editingAction.targetYear}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, targetYear: Number(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {YEARS.map(year => (
                        <option key={year} value={year}>
                          {getYearLabel(year)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Language
                    </label>
                    <select
                      value={editingAction.targetLanguage}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, targetLanguage: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LANGUAGES.map(language => (
                        <option key={language.id} value={language.id}>
                          {language.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type *
                    </label>
                    <select
                      value={editingAction.type}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, type: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="study">Study</option>
                      <option value="quiz">Quiz</option>
                      <option value="exercise">Exercise</option>
                      <option value="video">Video</option>
                      <option value="reading">Reading</option>
                      <option value="project">Project</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration *
                    </label>
                    <select
                      value={editingAction.duration}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, duration: e.target.value } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="15min">15 minutes</option>
                      <option value="30min">30 minutes</option>
                      <option value="45min">45 minutes</option>
                      <option value="1h">1 hour</option>
                      <option value="2h">2 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color Theme
                    </label>
                    <select
                      value={editingAction.color}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, color: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="blue">Blue</option>
                      <option value="purple">Purple</option>
                      <option value="green">Green</option>
                      <option value="red">Red</option>
                      <option value="yellow">Yellow</option>
                    </select>
                  </div>
                </div>

                {/* Points and Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Points Awarded
                    </label>
                    <input
                      type="number"
                      value={editingAction.points}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, points: parseInt(e.target.value) } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="0"
                      max="100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={editingAction.difficulty}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, difficulty: e.target.value as any } : null)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Active Status */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={editingAction.isActive}
                      onChange={(e) => setEditingAction(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Active (visible to students)</span>
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleCancelEdit}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}