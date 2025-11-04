// app/students/placementhub/components/ResumeTemplateCard.tsx

'use client';

import { ResumeTemplate } from '@/types/placementhub';
import { downloadTemplate } from '@/actions/placementhub-students-actions';
import { useState } from 'react';

interface ResumeTemplateCardProps {
  templates: ResumeTemplate[];
}

export function ResumeTemplateCard({ templates }: ResumeTemplateCardProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (template: ResumeTemplate) => {
    setDownloading(template.title);
    try {
      const result = await downloadTemplate(template.url, template.title);
      
      if (result.external) {
        window.open(template.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to open template. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pdf': return 'bg-red-100 text-red-800';
      case 'doc': return 'bg-blue-100 text-blue-800';
      case 'external': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'doc': return '📝';
      case 'external': return '🌐';
      default: return '📎';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Professional Resume Templates</h3>
      <p className="text-gray-600 mb-6">Choose from curated templates optimized for tech roles and top companies</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow flex flex-col h-full"
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900 text-sm flex-1 leading-tight">{template.title}</h4>
              <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(template.type)}`}>
                {getTypeIcon(template.type)} {template.type.toUpperCase()}
              </span>
            </div>
            
            <p className="text-xs text-gray-600 mb-3 flex-1">{template.description}</p>
            
            <div className="text-xs text-gray-500 mb-3">
              <span className="font-medium">Source:</span> {template.source}
            </div>
            
            <button
              onClick={() => handleDownload(template)}
              disabled={downloading === template.title}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-sm"
            >
              {downloading === template.title ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Opening...
                </>
              ) : (
                <>
                  View Template
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      
      {/* Additional Resources Section */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">More Resume Resources</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <a href="https://resume.io/resume-templates" target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-white rounded">
            <span className="mr-2">📝</span>
            Resume.io Templates
          </a>
          <a href="https://www.canva.com/resumes/templates/" target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-white rounded">
            <span className="mr-2">🎨</span>
            Canva Resume Templates
          </a>
          <a href="https://novoresume.com/resume-templates" target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-white rounded">
            <span className="mr-2">✨</span>
            NovoResume Templates
          </a>
          <a href="https://www.visualcv.com/resume-templates/" target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:text-blue-800 p-2 hover:bg-white rounded">
            <span className="mr-2">📊</span>
            VisualCV Templates
          </a>
        </div>
      </div>
    </div>
  );
}