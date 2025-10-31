'use client';

import { useState } from 'react';
import { ResourceFormData, CreateResourceInput, UpdateResourceInput } from '@/types/resource';

interface ResourceFormProps {
  resource?: any;
  onSave: (formData: CreateResourceInput | UpdateResourceInput) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
}

export default function ResourceForm({ resource, onSave, onCancel, isEditing = false }: ResourceFormProps) {
  const [formData, setFormData] = useState<ResourceFormData>({
    title: resource?.title || '',
    description: resource?.description || '',
    url: resource?.url || '',
    type: resource?.type || 'course',
    tags: resource?.tags?.join(', ') || '',
    level: resource?.level || 'beginner',
    free: resource?.free ?? true,
    certificate: resource?.certificate ?? false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData: CreateResourceInput = {
        title: formData.title,
        description: formData.description,
        url: formData.url,
        type: formData.type,
        tags: formData.tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag),
        level: formData.level,
        free: formData.free,
        certificate: formData.certificate,
      };

      await onSave(submitData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {isEditing ? 'Edit Resource' : 'Add New Resource'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter resource title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter resource description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">URL *</label>
            <input
              type="url"
              required
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as 'course' | 'internship' | 'portal' | 'newsletter' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="course">Course</option>
              <option value="internship">Internship</option>
              <option value="portal">Portal</option>
              <option value="newsletter">Newsletter</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Python, ML, Web Development"
            />
            <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Level *</label>
            <select
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value as 'beginner' | 'intermediate' | 'advanced' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.free}
                onChange={(e) => setFormData({ ...formData, free: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Free Resource</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.certificate}
                onChange={(e) => setFormData({ ...formData, certificate: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700">Certificate Available</span>
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Resource' : 'Create Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}