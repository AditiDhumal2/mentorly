// app/admin/roadmap/components/QuickActionsSection.tsx
'use client';

import { useState } from 'react';
import { type QuickAction } from '@/actions/admin-roadmap';
import QuickActionFormModal from './QuickActionFormModal';

interface QuickActionsSectionProps {
  quickActions: QuickAction[];
  roadmapId: string;
  roadmapYear: number;
  roadmapLanguage: string;
  onQuickActionCreate: (data: Omit<QuickAction, '_id'>) => Promise<{ success: boolean; error?: string }>;
  onQuickActionUpdate: (actionId: string, data: Partial<QuickAction>) => Promise<{ success: boolean; error?: string }>;
  onQuickActionDelete: (actionId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function QuickActionsSection({
  quickActions,
  roadmapId,
  roadmapYear,
  roadmapLanguage,
  onQuickActionCreate,
  onQuickActionUpdate,
  onQuickActionDelete
}: QuickActionsSectionProps) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [editingAction, setEditingAction] = useState<QuickAction | null>(null);

  const handleEdit = (action: QuickAction) => {
    setEditingAction(action);
    setShowActionForm(true);
  };

  const handleDelete = async (actionId: string) => {
    if (confirm('Are you sure you want to delete this quick action?')) {
      await onQuickActionDelete(actionId);
    }
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Quick Actions - Year {roadmapYear} {roadmapLanguage}
          </h2>
          <p className="text-gray-600 mt-1">
            Short, focused activities for {roadmapLanguage} in Year {roadmapYear}
          </p>
        </div>
        <button
          onClick={() => setShowActionForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          + Add Quick Action
        </button>
      </div>

      {quickActions.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-gray-400 mb-3">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quick actions yet</h3>
          <p className="text-gray-500 mb-4">Create quick actions to help students practice specific skills.</p>
          <button
            onClick={() => setShowActionForm(true)}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create Quick Action
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <div
              key={action._id}
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
                    onClick={() => handleDelete(action._id!)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{action.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="capitalize">{action.type}</span>
                <span>{action.duration}</span>
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
                  {action.tags.length > 3 && (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      +{action.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {action.resources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500">
                    {action.resources.length} resource{action.resources.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className={`text-xs px-2 py-1 rounded ${
                  action.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {action.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Form Modal */}
      {showActionForm && (
        <QuickActionFormModal
          action={editingAction}
          currentYear={roadmapYear}
          currentLanguage={roadmapLanguage}
          onSubmit={async (data: any) => {
            if (editingAction?._id) {
              return await onQuickActionUpdate(editingAction._id, data);
            } else {
              return await onQuickActionCreate(data);
            }
          }}
          onClose={() => {
            setShowActionForm(false);
            setEditingAction(null);
          }}
        />
      )}
    </div>
  );
}