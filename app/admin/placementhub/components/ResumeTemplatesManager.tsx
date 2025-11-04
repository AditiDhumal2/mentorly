// app/admin/placementhub/components/ResumeTemplatesManager.tsx

'use client';

import { useState } from 'react';
import { ResumeTemplate } from '@/types/placementhub';
import { addResumeTemplate, updateResumeTemplate, deleteResumeTemplate } from '@/actions/placementhub-admin-actions';

interface ResumeTemplatesManagerProps {
  initialTemplates: ResumeTemplate[];
}

export function ResumeTemplatesManager({ initialTemplates }: ResumeTemplatesManagerProps) {
  const [templates, setTemplates] = useState<ResumeTemplate[]>(initialTemplates);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [newTemplate, setNewTemplate] = useState<Omit<ResumeTemplate, 'id'>>({
    title: '',
    url: '',
    type: 'external',
    source: '',
    description: ''
  });

  const handleAddTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await addResumeTemplate(newTemplate);
      setTemplates([...templates, newTemplate as ResumeTemplate]);
      setNewTemplate({
        title: '',
        url: '',
        type: 'external',
        source: '',
        description: ''
      });
      setShowAddForm(false);
      setMessage(result.message);
    } catch (error) {
      setMessage('Error adding template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (index: number) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    setLoading(true);
    try {
      const result = await deleteResumeTemplate(index);
      setTemplates(templates.filter((_, i) => i !== index));
      setMessage(result.message);
    } catch (error) {
      setMessage('Error deleting template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Manage Resume Templates</h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Add New Template
        </button>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Add New Resume Template</h4>
          <form onSubmit={handleAddTemplate} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Template Title"
                value={newTemplate.title}
                onChange={(e) => setNewTemplate({ ...newTemplate, title: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="url"
                placeholder="Template URL"
                value={newTemplate.url}
                onChange={(e) => setNewTemplate({ ...newTemplate, url: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <select
                value={newTemplate.type}
                onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="external">External</option>
                <option value="pdf">PDF</option>
                <option value="doc">DOC</option>
              </select>
              <input
                type="text"
                placeholder="Source"
                value={newTemplate.source}
                onChange={(e) => setNewTemplate({ ...newTemplate, source: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <textarea
              placeholder="Description"
              value={newTemplate.description}
              onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Adding...' : 'Add Template'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {message && (
        <div className={`p-3 rounded-md mb-4 ${
          message.includes('Error') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <div className="space-y-3">
        {templates.map((template, index) => (
          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{template.title}</h4>
              <p className="text-sm text-gray-600">{template.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">Source: {template.source}</span>
                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">{template.type}</span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteTemplate(index)}
              disabled={loading}
              className="ml-4 bg-red-600 text-white py-1 px-3 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 transition-colors text-sm"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No resume templates added yet. Click "Add New Template" to get started.
        </div>
      )}
    </div>
  );
}