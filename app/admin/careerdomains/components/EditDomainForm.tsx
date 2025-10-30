'use client';

import { useState } from 'react';
import { updateCareerDomain } from '@/actions/careerdomain-admin-actions';
import { ICareerDomain } from '@/types/careerDomains';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Target } from 'lucide-react';

interface EditDomainFormProps {
  domain: ICareerDomain;
}

export default function EditDomainForm({ domain }: EditDomainFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: domain.name,
    description: domain.description,
    skills: domain.skills.join(', '),
    tools: domain.tools.join(', '),
    projects: domain.projects.join(', '),
    roles: domain.roles.join(', '),
    salaryIndia: domain.averageSalary.india,
    salaryAbroad: domain.averageSalary.abroad,
    relatedDomains: domain.relatedDomains.join(', ')
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key as keyof typeof formData]);
      });

      const result = await updateCareerDomain(domain._id, formDataObj);
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Career domain updated successfully!' });
        setTimeout(() => {
          router.push('/admin/careerdomains');
        }, 1500);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Domains</span>
          </button>
          
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Career Domain</h1>
              <p className="text-gray-600 mt-2">
                Update the details for <span className="font-semibold text-blue-600">{domain.name}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300">
          {message && (
            <div className={`p-4 rounded-xl mb-6 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Domain Name and Salary Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="e.g., Software Engineering"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary (India)
                  </label>
                  <input
                    type="text"
                    name="salaryIndia"
                    value={formData.salaryIndia}
                    onChange={handleChange}
                    placeholder="6-15 LPA"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salary (Abroad)
                  </label>
                  <input
                    type="text"
                    name="salaryAbroad"
                    value={formData.salaryAbroad}
                    onChange={handleChange}
                    placeholder="$70,000-$130,000"
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none transition-all duration-200"
                placeholder="Describe this career domain and its opportunities..."
              />
            </div>

            {/* Skills and Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skills (comma separated) *
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="JavaScript, Python, React..."
                />
                <p className="text-xs text-gray-500 mt-2">Separate multiple skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tools (comma separated)
                </label>
                <input
                  type="text"
                  name="tools"
                  value={formData.tools}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="VS Code, Git, Docker..."
                />
                <p className="text-xs text-gray-500 mt-2">Separate tools with commas</p>
              </div>
            </div>

            {/* Projects and Roles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Ideas (comma separated)
                </label>
                <input
                  type="text"
                  name="projects"
                  value={formData.projects}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="E-commerce app, Portfolio website..."
                />
                <p className="text-xs text-gray-500 mt-2">Separate project ideas with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Common Roles (comma separated)
                </label>
                <input
                  type="text"
                  name="roles"
                  value={formData.roles}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                  placeholder="Frontend Developer, Backend Engineer..."
                />
                <p className="text-xs text-gray-500 mt-2">Separate roles with commas</p>
              </div>
            </div>

            {/* Related Domains */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Related Domains (comma separated)
              </label>
              <input
                type="text"
                name="relatedDomains"
                value={formData.relatedDomains}
                onChange={handleChange}
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-200"
                placeholder="Web Development, Mobile Development..."
              />
              <p className="text-xs text-gray-500 mt-2">Separate related domains with commas</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Update Domain</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}