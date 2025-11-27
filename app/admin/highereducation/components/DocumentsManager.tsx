// app/admin/highereducation/components/DocumentsManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { updateApplicationDocuments } from '@/actions/highereducation-admin-actions';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Snackbar from '@/components/Snackbar';
import { ApplicationDocument, DocumentsManagerProps, DocumentTemplate, DocumentExample } from '@/types/higher-education';

export default function DocumentsManager({ documents }: DocumentsManagerProps) {
  const [localDocuments, setLocalDocuments] = useState<ApplicationDocument[]>(documents);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingDocument, setEditingDocument] = useState<ApplicationDocument | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; docId: string | null; docName: string }>({
    isOpen: false,
    docId: null,
    docName: ''
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    
    try {
      await updateApplicationDocuments(localDocuments);
      setMessage({ type: 'success', text: 'Application documents saved successfully!' });
      showSnackbar('Application documents saved successfully!', 'success');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save data. Please try again.' });
      showSnackbar('Failed to save data. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDocument = () => {
    const newDocument: ApplicationDocument = {
      _id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // More unique ID
      type: 'new-document',
      title: 'New Document',
      guidelines: ['First guideline', 'Second guideline'],
      templates: [
        {
          title: 'New Template',
          downloadUrl: '/templates/new-template.pdf',
          forUniversities: ['All Universities']
        }
      ],
      examples: [
        {
          title: 'Example Document',
          field: 'General',
          preview: 'This is a preview of the example document...'
        }
      ],
      commonMistakes: ['Common mistake 1', 'Common mistake 2']
    };
    setLocalDocuments(prev => [...prev, newDocument]);
    showSnackbar('New document added successfully!', 'success');
  };

  const handleDeleteDocument = (docId: string) => {
    const doc = localDocuments.find(d => d._id === docId);
    setDeleteModal({
      isOpen: true,
      docId,
      docName: doc?.title || 'this document'
    });
  };

  const confirmDeleteDocument = () => {
    if (deleteModal.docId) {
      setLocalDocuments(prev => prev.filter(doc => doc._id !== deleteModal.docId));
      setDeleteModal({ isOpen: false, docId: null, docName: '' });
      showSnackbar('Document deleted successfully!', 'success');
    }
  };

  const handleUpdateDocument = (updatedDocument: ApplicationDocument) => {
    setLocalDocuments(prev => prev.map(doc => 
      doc._id === updatedDocument._id ? updatedDocument : doc
    ));
    setEditingDocument(null);
    showSnackbar('Document updated successfully!', 'success');
  };

  const getDocumentIcon = (type: string): string => {
    const icons: { [key: string]: string } = {
      sop: '📝',
      lor: '✉️',
      cv: '📄',
      portfolio: '💼',
      transcripts: '📊'
    };
    return icons[type] || '📋';
  };

  const getDocumentColor = (type: string): string => {
    const colors: { [key: string]: string } = {
      sop: 'blue',
      lor: 'green',
      cv: 'purple',
      portfolio: 'orange',
      transcripts: 'indigo'
    };
    return colors[type] || 'gray';
  };

  // Generate a stable key for each document
  const getDocumentKey = (doc: ApplicationDocument, index: number): string => {
    return doc._id || `doc-${index}-${doc.type}`;
  };

  if (!isClient) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Application Documents</h3>
          <p className="text-gray-600 text-sm mt-1">
            Manage SOP, LOR, CV, portfolios, and other application requirements
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddDocument}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            type="button"
          >
            Add Document
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            type="button"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
        }`}>
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-800' : 'text-red-800'
          }`}>
            {message.text}
          </p>
        </div>
      )}

      {/* Documents Grid - Only show when there are documents */}
      {localDocuments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localDocuments.map((doc, index) => (
            <div key={getDocumentKey(doc, index)} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getDocumentIcon(doc.type)}</span>
                  <div>
                    <h4 className="font-bold text-gray-900">{doc.title}</h4>
                    <p className="text-sm text-gray-600 capitalize">{doc.type}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full bg-${getDocumentColor(doc.type)}-100 text-${getDocumentColor(doc.type)}-800`}>
                  {doc.type.toUpperCase()}
                </span>
              </div>

              {/* Guidelines */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Key Guidelines</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {doc.guidelines?.slice(0, 3).map((guideline: string, idx: number) => (
                    <li key={`guideline-${index}-${idx}-${guideline.substring(0, 10)}`} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{guideline.length > 80 ? guideline.substring(0, 80) + '...' : guideline}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Templates */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Templates ({doc.templates?.length || 0})</h5>
                <div className="space-y-2">
                  {doc.templates?.slice(0, 2).map((template: DocumentTemplate, idx: number) => (
                    <div key={`template-${index}-${idx}-${template.title.substring(0, 10)}`} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                      <span className="text-gray-700">{template.title}</span>
                      <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                        {template.forUniversities?.length || 0} unis
                      </span>
                    </div>
                  ))}
                  {doc.templates && doc.templates.length > 2 && (
                    <div className="text-sm text-gray-500 text-center">
                      +{doc.templates.length - 2} more templates
                    </div>
                  )}
                </div>
              </div>

              {/* Common Mistakes */}
              <div className="mb-4">
                <h5 className="font-medium text-gray-700 mb-2">Common Mistakes</h5>
                <div className="text-sm text-gray-600">
                  {doc.commonMistakes?.slice(0, 2).map((mistake: string, idx: number) => (
                    <div key={`mistake-${index}-${idx}-${mistake.substring(0, 10)}`} className="flex items-start mb-1">
                      <span className="text-red-500 mr-2">⚠</span>
                      <span>{mistake.length > 60 ? mistake.substring(0, 60) + '...' : mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Examples */}
              {doc.examples && doc.examples.length > 0 && (
                <div className="mb-4">
                  <h5 className="font-medium text-gray-700 mb-2">Examples Available</h5>
                  <div className="text-sm text-gray-600">
                    {doc.examples.slice(0, 1).map((example: DocumentExample, idx: number) => (
                      <div key={`example-${index}-${idx}-${example.title.substring(0, 10)}`} className="bg-blue-50 rounded p-2">
                        <div className="font-medium text-blue-800">{example.title}</div>
                        <div className="text-blue-600 text-xs mt-1">
                          {example.preview?.length > 80 ? example.preview.substring(0, 80) + '...' : example.preview}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setEditingDocument(doc)}
                  className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  type="button"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteDocument(doc._id)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State - Only show when there are NO documents */}
      {localDocuments.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-4">📄</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Added</h3>
          <p className="text-gray-600 mb-4">Start by adding document templates and guidelines for SOP, LOR, CV, etc.</p>
          <button
            onClick={handleAddDocument}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            Add First Document
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingDocument && (
        <DocumentEditModal
          document={editingDocument}
          onSave={handleUpdateDocument}
          onClose={() => setEditingDocument(null)}
        />
      )}

      {/* Delete Confirmation Modal - FIXED: Removed confirmText prop */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, docId: null, docName: '' })}
        onConfirm={confirmDeleteDocument}
        title="Delete Document"
        message={`Are you sure you want to delete "${deleteModal.docName}"? This action cannot be undone.`}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// Document Edit Modal Component
interface DocumentEditModalProps {
  document: ApplicationDocument;
  onSave: (document: ApplicationDocument) => void;
  onClose: () => void;
}

function DocumentEditModal({ document, onSave, onClose }: DocumentEditModalProps) {
  const [formData, setFormData] = useState<ApplicationDocument>(document);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: keyof ApplicationDocument, value: any) => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      [field]: value
    }));
  };

  const addGuideline = () => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      guidelines: [...(prev.guidelines || []), 'New guideline']
    }));
  };

  const removeGuideline = (index: number) => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      guidelines: (prev.guidelines || []).filter((_, i) => i !== index)
    }));
  };

  const addTemplate = () => {
    const newTemplate: DocumentTemplate = {
      title: 'New Template',
      downloadUrl: '/templates/new-template.pdf',
      forUniversities: ['All Universities']
    };
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      templates: [...(prev.templates || []), newTemplate]
    }));
  };

  const removeTemplate = (index: number) => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      templates: (prev.templates || []).filter((_, i) => i !== index)
    }));
  };

  const updateTemplate = (index: number, field: keyof DocumentTemplate, value: any) => {
    const newTemplates = [...(formData.templates || [])];
    newTemplates[index] = {
      ...newTemplates[index],
      [field]: value
    };
    handleChange('templates', newTemplates);
  };

  const addExample = () => {
    const newExample: DocumentExample = {
      title: 'New Example',
      field: 'General',
      preview: 'Example preview text...'
    };
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      examples: [...(prev.examples || []), newExample]
    }));
  };

  const removeExample = (index: number) => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      examples: (prev.examples || []).filter((_, i) => i !== index)
    }));
  };

  const updateExample = (index: number, field: keyof DocumentExample, value: any) => {
    const newExamples = [...(formData.examples || [])];
    newExamples[index] = {
      ...newExamples[index],
      [field]: value
    };
    handleChange('examples', newExamples);
  };

  const addMistake = () => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      commonMistakes: [...(prev.commonMistakes || []), 'New common mistake']
    }));
  };

  const removeMistake = (index: number) => {
    setFormData((prev: ApplicationDocument) => ({
      ...prev,
      commonMistakes: (prev.commonMistakes || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Edit {document.title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl"
              type="button"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="sop">Statement of Purpose (SOP)</option>
                <option value="lor">Letters of Recommendation (LOR)</option>
                <option value="cv">Curriculum Vitae (CV)</option>
                <option value="portfolio">Portfolio</option>
                <option value="transcripts">Transcripts</option>
                <option value="new-document">Other Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Document Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Guidelines */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Guidelines ({(formData.guidelines || []).length})</h4>
              <button
                type="button"
                onClick={addGuideline}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Guideline
              </button>
            </div>
            <div className="space-y-2">
              {(formData.guidelines || []).map((guideline: string, index: number) => (
                <div key={`edit-guideline-${index}-${guideline.substring(0, 10)}`} className="flex items-center space-x-2">
                  <textarea
                    value={guideline}
                    onChange={(e) => {
                      const newGuidelines = [...(formData.guidelines || [])];
                      newGuidelines[index] = e.target.value;
                      handleChange('guidelines', newGuidelines);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                  <button
                    type="button"
                    onClick={() => removeGuideline(index)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Templates ({(formData.templates || []).length})</h4>
              <button
                type="button"
                onClick={addTemplate}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Template
              </button>
            </div>
            <div className="space-y-4">
              {(formData.templates || []).map((template: DocumentTemplate, index: number) => (
                <div key={`edit-template-${index}-${template.title.substring(0, 10)}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">Template #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeTemplate(index)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template Title</label>
                      <input
                        type="text"
                        value={template.title}
                        onChange={(e) => updateTemplate(index, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Download URL</label>
                      <input
                        type="text"
                        value={template.downloadUrl}
                        onChange={(e) => updateTemplate(index, 'downloadUrl', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">For Universities</label>
                    <textarea
                      value={template.forUniversities?.join(', ') || ''}
                      onChange={(e) => updateTemplate(index, 'forUniversities', e.target.value.split(',').map((u: string) => u.trim()))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="MIT, Stanford, Harvard"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">Separate universities with commas</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Examples */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Examples ({(formData.examples || []).length})</h4>
              <button
                type="button"
                onClick={addExample}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Example
              </button>
            </div>
            <div className="space-y-4">
              {(formData.examples || []).map((example: DocumentExample, index: number) => (
                <div key={`edit-example-${index}-${example.title.substring(0, 10)}`} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">Example #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeExample(index)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Example Title</label>
                      <input
                        type="text"
                        value={example.title}
                        onChange={(e) => updateExample(index, 'title', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                      <input
                        type="text"
                        value={example.field}
                        onChange={(e) => updateExample(index, 'field', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Preview</label>
                    <textarea
                      value={example.preview}
                      onChange={(e) => updateExample(index, 'preview', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Common Mistakes ({(formData.commonMistakes || []).length})</h4>
              <button
                type="button"
                onClick={addMistake}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Mistake
              </button>
            </div>
            <div className="space-y-2">
              {(formData.commonMistakes || []).map((mistake: string, index: number) => (
                <div key={`edit-mistake-${index}-${mistake.substring(0, 10)}`} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={mistake}
                    onChange={(e) => {
                      const newMistakes = [...(formData.commonMistakes || [])];
                      newMistakes[index] = e.target.value;
                      handleChange('commonMistakes', newMistakes);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeMistake(index)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}