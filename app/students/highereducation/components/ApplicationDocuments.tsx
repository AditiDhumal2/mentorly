// app/students/highereducation/components/ApplicationDocuments.tsx
'use client';

import { useState } from 'react';
import { ApplicationDocument } from '@/types/higher-education';
import { updateDocumentStatus } from '@/actions/highereducation-students-actions';

interface ApplicationDocumentsProps {
  documents: ApplicationDocument[];
}

// Define the valid status types
type DocumentStatus = 'completed' | 'draft' | 'not_started' | 'reviewing';

export default function ApplicationDocuments({ documents }: ApplicationDocumentsProps) {
  const [selectedDoc, setSelectedDoc] = useState<ApplicationDocument | null>(null);

  // Helper functions for unique keys
  const getDocumentKey = (doc: ApplicationDocument, index: number) => {
    return doc._id || `doc-${index}`;
  };

  const getTemplateKey = (template: any, index: number) => {
    return template._id || `template-${index}`;
  };

  const getExampleKey = (example: any, index: number) => {
    return example._id || `example-${index}`;
  };

  const handleStatusUpdate = async (docType: string, status: DocumentStatus) => {
    try {
      await updateDocumentStatus(docType, status);
      alert('Status updated successfully!');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Application Documents</h2>
      
      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {documents.map((doc, index) => (
          <div
            key={getDocumentKey(doc, index)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedDoc?._id === doc._id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:shadow-md'
            }`}
            onClick={() => setSelectedDoc(doc)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{doc.title}</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {doc.guidelines.length} guidelines available
                </p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {doc.type.toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {selectedDoc && (
        <div className="space-y-6">
          {/* Guidelines */}
          <div>
            <h3 className="text-xl font-bold mb-4">Guidelines for {selectedDoc.title}</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {selectedDoc.guidelines.map((guideline, index) => (
                <li key={`guideline-${index}`}>{guideline}</li>
              ))}
            </ul>
          </div>

          {/* Templates */}
          <div>
            <h3 className="text-xl font-bold mb-4">Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedDoc.templates.map((template, index) => (
                <div key={getTemplateKey(template, index)} className="border rounded-lg p-4">
                  <h4 className="font-semibold">{template.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    For: {template.forUniversities.join(', ')}
                  </p>
                  <a
                    href={template.downloadUrl}
                    download
                    className="inline-block mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Download Template
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div>
            <h3 className="text-xl font-bold mb-4">Examples</h3>
            <div className="space-y-4">
              {selectedDoc.examples.map((example, index) => (
                <div key={getExampleKey(example, index)} className="border rounded-lg p-4">
                  <h4 className="font-semibold">{example.title}</h4>
                  <p className="text-sm text-gray-600">Field: {example.field}</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{example.preview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div>
            <h3 className="text-xl font-bold mb-4">Common Mistakes to Avoid</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              {selectedDoc.commonMistakes.map((mistake, index) => (
                <li key={`mistake-${index}`}>{mistake}</li>
              ))}
            </ul>
          </div>

          {/* Status Update */}
          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Update Your Progress</h3>
            <div className="flex space-x-4">
              {(['not_started', 'draft', 'reviewing', 'completed'] as DocumentStatus[]).map((status) => (
                <button
                  key={`status-${status}`}
                  onClick={() => handleStatusUpdate(selectedDoc.type, status)}
                  className={`px-4 py-2 rounded-md capitalize ${
                    status === 'not_started' ? 'bg-gray-500 text-white' :
                    status === 'draft' ? 'bg-yellow-500 text-white' :
                    status === 'reviewing' ? 'bg-blue-500 text-white' :
                    'bg-green-500 text-white'
                  } hover:opacity-90`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}