'use client';

import { useState } from 'react';
import { createCareerDomain } from '@/actions/careerdomain-admin-actions';
import { Plus, Target } from 'lucide-react';

interface FormData {
  name: string;
  description: string;
  skills: string;
  tools: string;
  projects: string;
  roles: string;
  salaryIndia: string;
  salaryAbroad: string;
  relatedDomains: string;
}

const initialFormData: FormData = {
  name: '',
  description: '',
  skills: '',
  tools: '',
  projects: '',
  roles: '',
  salaryIndia: '',
  salaryAbroad: '',
  relatedDomains: ''
};

interface CreateDomainFormProps {
  onDomainCreated: () => void;
}

export default function CreateDomainForm({ onDomainCreated }: CreateDomainFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key as keyof FormData]);
      });
      formDataObj.append('resources', JSON.stringify([]));

      const result = await createCareerDomain(formDataObj);
      
      if (result.success) {
        setFormData(initialFormData);
        setMessage({ type: 'success', text: 'Career domain created successfully!' });
        onDomainCreated();
      } else {
        setMessage({ type: 'error', text: `Error: ${result.error}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="h-full">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
          <Target className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Create New Domain</h3>
          <p className="text-sm text-gray-600">Add a new career domain</p>
        </div>
      </div>
      
      {message && (
        <div className={`p-4 rounded-xl mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Domain Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            placeholder="e.g., Software Engineering, Data Science"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none transition-all duration-200"
            placeholder="Describe this career domain and its opportunities..."
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">
            Skills (comma separated) *
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            required
            value={formData.skills}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            placeholder="JavaScript, Python, React, Node.js..."
          />
          <p className="text-xs text-gray-500 mt-2">Separate multiple skills with commas</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="tools" className="block text-sm font-medium text-gray-700 mb-2">
              Tools
            </label>
            <input
              type="text"
              id="tools"
              name="tools"
              value={formData.tools}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              placeholder="VS Code, Git, Docker..."
            />
          </div>

          <div>
            <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-2">
              Roles
            </label>
            <input
              type="text"
              id="roles"
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              placeholder="Frontend Developer, Backend Engineer..."
            />
          </div>
        </div>

        <div>
          <label htmlFor="projects" className="block text-sm font-medium text-gray-700 mb-2">
            Project Ideas
          </label>
          <input
            type="text"
            id="projects"
            name="projects"
            value={formData.projects}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            placeholder="E-commerce app, Portfolio website..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="salaryIndia" className="block text-sm font-medium text-gray-700 mb-2">
              Salary (India)
            </label>
            <input
              type="text"
              id="salaryIndia"
              name="salaryIndia"
              value={formData.salaryIndia}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              placeholder="e.g., 8-15 LPA"
            />
          </div>

          <div>
            <label htmlFor="salaryAbroad" className="block text-sm font-medium text-gray-700 mb-2">
              Salary (Abroad)
            </label>
            <input
              type="text"
              id="salaryAbroad"
              name="salaryAbroad"
              value={formData.salaryAbroad}
              onChange={handleChange}
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
              placeholder="e.g., $80,000-$120,000"
            />
          </div>
        </div>

        <div>
          <label htmlFor="relatedDomains" className="block text-sm font-medium text-gray-700 mb-2">
            Related Domains
          </label>
          <input
            type="text"
            id="relatedDomains"
            name="relatedDomains"
            value={formData.relatedDomains}
            onChange={handleChange}
            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
            placeholder="Web Development, Mobile Development..."
          />
          <p className="text-xs text-gray-500 mt-2">Separate related domains with commas</p>
        </div>

        <button
          type="submit"
          disabled={isLoading || !formData.name.trim() || !formData.description.trim() || !formData.skills.trim()}
          className="w-full flex items-center justify-center space-x-2 px-6 py-4 text-base bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              <span>Create Domain</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}