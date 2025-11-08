'use client';

import { useState, useEffect } from 'react';
import { updateTARAGuides } from '@/actions/highereducation-admin-actions';
import { TA_RAGuideItem, TA_RAManagerProps } from '@/types/higher-education';

export default function TA_RAManager({ taRaGuides }: TA_RAManagerProps) {
  const [localGuides, setLocalGuides] = useState<TA_RAGuideItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newGuide, setNewGuide] = useState<Partial<TA_RAGuideItem>>({
    countryName: '',
    eligibility: [''],
    requirements: [''],
    applicationProcess: [''],
    tips: [''],
    documentsRequired: [''],
    averageStipend: '',
    benefits: [''],
    timeline: ['']
  });

  useEffect(() => {
    console.log('🔄 TA_RAManager received guides:', taRaGuides?.length);
    setLocalGuides(taRaGuides || []);
  }, [taRaGuides]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateTARAGuides(localGuides);
      if (result.success) {
        showMessage('TA/RA guides saved successfully!', 'success');
      } else {
        showMessage(result.error || 'Failed to save guides', 'error');
      }
    } catch (error: any) {
      showMessage(error.message || 'Failed to save guides', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGuide = () => {
    if (!newGuide.countryName?.trim()) {
      showMessage('Please enter a country name', 'error');
      return;
    }

    const guideToAdd: TA_RAGuideItem = {
      _id: `guide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      countryId: `country-${Date.now()}`,
      countryName: newGuide.countryName.trim(),
      eligibility: newGuide.eligibility?.filter(e => e.trim()) || [],
      requirements: newGuide.requirements?.filter(r => r.trim()) || [],
      applicationProcess: newGuide.applicationProcess?.filter(a => a.trim()) || [],
      tips: newGuide.tips?.filter(t => t.trim()) || [],
      documentsRequired: newGuide.documentsRequired?.filter(d => d.trim()) || [],
      averageStipend: newGuide.averageStipend || '$0',
      benefits: newGuide.benefits?.filter(b => b.trim()) || [],
      timeline: newGuide.timeline?.filter(t => t.trim()) || []
    };

    setLocalGuides(prev => [...prev, guideToAdd]);
    setNewGuide({
      countryName: '',
      eligibility: [''],
      requirements: [''],
      applicationProcess: [''],
      tips: [''],
      documentsRequired: [''],
      averageStipend: '',
      benefits: [''],
      timeline: ['']
    });
    setIsAdding(false);
    showMessage('TA/RA guide added successfully!', 'success');
  };

  const handleDeleteGuide = (guideId: string) => {
    if (!confirm('Are you sure you want to delete this guide?')) return;
    setLocalGuides(prev => prev.filter(guide => guide._id !== guideId));
    showMessage('Guide deleted successfully!', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">TA/RA Guides Management</h2>
          <p className="text-gray-600 mt-1">
            Manage Teaching Assistant and Research Assistant guides for different countries
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
          >
            Add Guide
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Add Guide Form */}
      {isAdding && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Add New TA/RA Guide</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name *
              </label>
              <input
                type="text"
                value={newGuide.countryName}
                onChange={(e) => setNewGuide({ ...newGuide, countryName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., United States"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Stipend
              </label>
              <input
                type="text"
                value={newGuide.averageStipend}
                onChange={(e) => setNewGuide({ ...newGuide, averageStipend: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., $2,000 - $3,000 per month"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddGuide}
              disabled={!newGuide.countryName?.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Guide
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Guides List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            TA/RA Guides ({localGuides.length})
          </h3>
          
          {localGuides.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">👨‍🏫</div>
              <p className="text-lg">No TA/RA guides added yet</p>
              <p className="text-sm mt-1">Click "Add Guide" to create your first guide</p>
            </div>
          ) : (
            <div className="space-y-4">
              {localGuides.map((guide) => (
                <div key={guide._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-lg text-gray-900">{guide.countryName}</h4>
                    <button
                      onClick={() => handleDeleteGuide(guide._id)}
                      className="text-red-600 hover:text-red-800 p-1"
                    >
                      Delete
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Average Stipend:</span>
                      <p>{guide.averageStipend}</p>
                    </div>
                    <div>
                      <span className="font-medium">Eligibility:</span>
                      <p>{guide.eligibility.length} criteria</p>
                    </div>
                    <div>
                      <span className="font-medium">Requirements:</span>
                      <p>{guide.requirements.length} items</p>
                    </div>
                    <div>
                      <span className="font-medium">Documents:</span>
                      <p>{guide.documentsRequired.length} required</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}