// app/admin/professionalbranding/components/EditChecklistModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { updateBrandingChecklist } from '@/actions/professionalbranding-admin-actions';
import { AdminBrandingChecklist, BrandingTask } from '@/types/professionalBranding';

interface EditChecklistModalProps {
  checklist: AdminBrandingChecklist;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Define a proper task type for the form
interface FormTask {
  _id?: string;
  title: string;
  description: string;
  category: 'linkedin' | 'github' | 'leetcode' | 'internship' | 'resume';
  doneBy: string;
  optional: boolean;
  tutorial?: {
    title: string;
    platform: string;
    url: string;
  };
  order?: number;
}

const defaultTask: FormTask = {
  title: '',
  description: '',
  category: 'linkedin',
  doneBy: 'Q1',
  optional: false,
  tutorial: { title: '', platform: '', url: '' }
};

type TutorialField = 'title' | 'platform' | 'url';

export function EditChecklistModal({ checklist, isOpen, onClose, onSuccess }: EditChecklistModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<{
    year: number;
    tasks: FormTask[];
  }>({
    year: checklist.year,
    tasks: []
  });

  // Convert BrandingTask to FormTask
  const convertToFormTask = (task: BrandingTask): FormTask => ({
    _id: task._id,
    title: task.title,
    description: task.description,
    category: task.category,
    doneBy: task.doneBy,
    optional: task.optional || false,
    tutorial: task.tutorial ? {
      title: task.tutorial.title || '',
      platform: task.tutorial.platform || '',
      url: task.tutorial.url || ''
    } : undefined,
    order: task.order
  });

  useEffect(() => {
    if (checklist) {
      const formTasks = checklist.tasks.map(convertToFormTask);
      setFormData({
        year: checklist.year,
        tasks: formTasks
      });
    }
  }, [checklist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Filter out empty tasks and convert back to BrandingTask format
      const validTasks = formData.tasks
        .filter(task => task.title.trim() && task.description.trim())
        .map(task => ({
          title: task.title,
          description: task.description,
          category: task.category,
          doneBy: task.doneBy,
          optional: task.optional,
          tutorial: task.tutorial?.title || task.tutorial?.platform || task.tutorial?.url 
            ? {
                title: task.tutorial.title || '',
                platform: task.tutorial.platform || '',
                url: task.tutorial.url || ''
              }
            : undefined,
          order: task.order
        }));

      if (validTasks.length === 0) {
        alert('Please add at least one valid task');
        setIsLoading(false);
        return;
      }

      const result = await updateBrandingChecklist(checklist.year, {
        year: formData.year,
        tasks: validTasks
      });

      if (result.success) {
        alert('Checklist updated successfully!');
        onSuccess();
        onClose();
      } else {
        alert(`Failed to update checklist: ${result.error}`);
      }
    } catch (error) {
      console.error('Error updating checklist:', error);
      alert('Failed to update checklist');
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = () => {
    setFormData(prev => ({
      ...prev,
      tasks: [...prev.tasks, { 
        ...defaultTask, 
        _id: `temp-${Date.now()}` 
      }]
    }));
  };

  const removeTask = (index: number) => {
    if (formData.tasks.length > 1) {
      setFormData(prev => ({
        ...prev,
        tasks: prev.tasks.filter((_, i) => i !== index)
      }));
    }
  };

  const updateTask = (index: number, field: keyof FormTask, value: any) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => 
        i === index ? { ...task, [field]: value } : task
      )
    }));
  };

  const updateTutorial = (index: number, field: TutorialField, value: string) => {
    setFormData(prev => ({
      ...prev,
      tasks: prev.tasks.map((task, i) => {
        if (i === index) {
          const currentTutorial = task.tutorial || { title: '', platform: '', url: '' };
          return {
            ...task,
            tutorial: {
              ...currentTutorial,
              [field]: value
            }
          };
        }
        return task;
      })
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Edit Checklist - Year {checklist.year}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Tasks Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Checklist Tasks *
              </label>
              <button
                type="button"
                onClick={addTask}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="space-y-4">
              {formData.tasks.map((task, index) => (
                <div key={task._id || index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-gray-900">Task {index + 1}</h3>
                    {formData.tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Task Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Task Title *
                      </label>
                      <input
                        type="text"
                        value={task.title}
                        onChange={(e) => updateTask(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Create LinkedIn Profile"
                        required
                      />
                    </div>

                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category *
                      </label>
                      <select
                        value={task.category}
                        onChange={(e) => updateTask(index, 'category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="linkedin">LinkedIn</option>
                        <option value="github">GitHub</option>
                        <option value="leetcode">LeetCode</option>
                        <option value="internship">Internship</option>
                        <option value="resume">Resume</option>
                      </select>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      value={task.description}
                      onChange={(e) => updateTask(index, 'description', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe what the student needs to do..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Due By */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Complete By *
                      </label>
                      <select
                        value={task.doneBy}
                        onChange={(e) => updateTask(index, 'doneBy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="Q1">Quarter 1</option>
                        <option value="Q2">Quarter 2</option>
                        <option value="Q3">Quarter 3</option>
                        <option value="Q4">Quarter 4</option>
                        <option value="End of Year">End of Year</option>
                      </select>
                    </div>

                    {/* Optional */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.optional}
                        onChange={(e) => updateTask(index, 'optional', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Optional Task
                      </label>
                    </div>
                  </div>

                  {/* Tutorial Section */}
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Tutorial (Optional)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Tutorial Title</label>
                        <input
                          type="text"
                          value={task.tutorial?.title || ''}
                          onChange={(e) => updateTutorial(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., LinkedIn Setup Guide"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Platform</label>
                        <input
                          type="text"
                          value={task.tutorial?.platform || ''}
                          onChange={(e) => updateTutorial(index, 'platform', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., YouTube, Official Docs"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">URL</label>
                        <input
                          type="url"
                          value={task.tutorial?.url || ''}
                          onChange={(e) => updateTutorial(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="https://example.com/tutorial"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Updating...' : 'Update Checklist'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}