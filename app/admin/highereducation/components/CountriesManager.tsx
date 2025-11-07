// app/admin/highereducation/components/CountriesManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { updateCountriesData } from '@/actions/highereducation-admin-actions'; // Fixed import name
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal';
import Snackbar from '@/components/Snackbar';
import { Country, CountriesManagerProps, UniversityDetail, TA_RAGuide } from '@/types/higher-education';

export default function CountriesManager({ countries }: CountriesManagerProps) {
  const [localCountries, setLocalCountries] = useState<Country[]>(countries);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; countryId: string | null; countryName: string }>({
    isOpen: false,
    countryId: null,
    countryName: ''
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
      await updateCountriesData(localCountries); // Fixed function name
      setMessage({ type: 'success', text: 'Countries data saved successfully!' });
      showSnackbar('Countries data saved successfully!', 'success');
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save data. Please try again.' });
      showSnackbar('Failed to save data. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCountry = () => {
    const newCountry: Country = {
      _id: `country-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New Country',
      code: 'XX',
      topInstitutes: [],
      visaRequirements: [],
      costOfLiving: {
        monthly: '$0',
        yearly: '$0'
      }
    };
    setLocalCountries(prev => [...prev, newCountry]);
    showSnackbar('New country added successfully!', 'success');
  };

  const handleDeleteCountry = (countryId: string) => {
    const country = localCountries.find(c => c._id === countryId);
    setDeleteModal({
      isOpen: true,
      countryId,
      countryName: country?.name || 'this country'
    });
  };

  const confirmDeleteCountry = () => {
    if (deleteModal.countryId) {
      setLocalCountries(prev => prev.filter(country => country._id !== deleteModal.countryId));
      setDeleteModal({ isOpen: false, countryId: null, countryName: '' });
      showSnackbar('Country deleted successfully!', 'success');
    }
  };

  const handleUpdateCountry = (updatedCountry: Country) => {
    setLocalCountries(prev => prev.map(country => 
      country._id === updatedCountry._id ? updatedCountry : country
    ));
    setEditingCountry(null);
    showSnackbar('Country updated successfully!', 'success');
  };

  const getCountryKey = (country: Country, index: number): string => {
    return country._id || `country-${index}-${country.code}`;
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
          <h3 className="text-lg font-bold text-gray-900">Study Destinations</h3>
          <p className="text-gray-600 text-sm mt-1">
            Manage countries, universities, visa requirements, and cost of living information
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleAddCountry}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            type="button"
          >
            Add Country
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

      {/* Countries Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {localCountries.map((country, index) => (
          <div key={getCountryKey(country, index)} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {country.flag && <span className="text-2xl">{country.flag}</span>}
                <div>
                  <h4 className="font-bold text-gray-900">{country.name}</h4>
                  <p className="text-sm text-gray-600">{country.code}</p>
                </div>
              </div>
              {country.popularity && (
                <span className={`px-3 py-1 text-xs rounded-full ${
                  country.popularity === 'high' ? 'bg-green-100 text-green-800' :
                  country.popularity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {country.popularity}
                </span>
              )}
            </div>

            {/* Top Institutes */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Top Institutes ({country.topInstitutes?.length || 0})</h5>
              <div className="space-y-2">
                {country.topInstitutes?.slice(0, 2).map((uni: UniversityDetail, idx: number) => (
                  <div key={`uni-${index}-${idx}-${uni.name.substring(0, 10)}`} className="flex items-center justify-between text-sm bg-gray-50 rounded p-2">
                    <span className="text-gray-700">{uni.name}</span>
                    <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded">
                      Rank #{uni.ranking}
                    </span>
                  </div>
                ))}
                {country.topInstitutes && country.topInstitutes.length > 2 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{country.topInstitutes.length - 2} more universities
                  </div>
                )}
              </div>
            </div>

            {/* Cost of Living */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Cost of Living</h5>
              <div className="text-sm text-gray-600">
                <div>Monthly: {country.costOfLiving?.monthly || 'N/A'}</div>
                <div>Yearly: {country.costOfLiving?.yearly || 'N/A'}</div>
              </div>
            </div>

            {/* Visa Requirements */}
            <div className="mb-4">
              <h5 className="font-medium text-gray-700 mb-2">Visa Requirements ({country.visaRequirements?.length || 0})</h5>
              <div className="text-sm text-gray-600">
                {country.visaRequirements?.slice(0, 2).map((req: string, idx: number) => (
                  <div key={`visa-${index}-${idx}-${req.substring(0, 10)}`} className="flex items-start mb-1">
                    <span className="mr-2">•</span>
                    <span>{req.length > 60 ? req.substring(0, 60) + '...' : req}</span>
                  </div>
                ))}
                {country.visaRequirements && country.visaRequirements.length > 2 && (
                  <div className="text-gray-500">+{country.visaRequirements.length - 2} more requirements</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setEditingCountry(country)}
                className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                type="button"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeleteCountry(country._id)}
                className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {localCountries.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-4">🌍</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Countries Added</h3>
          <p className="text-gray-600 mb-4">Start by adding study destinations with university information and visa requirements.</p>
          <button
            onClick={handleAddCountry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            Add First Country
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {editingCountry && (
        <CountryEditModal
          country={editingCountry}
          onSave={handleUpdateCountry}
          onClose={() => setEditingCountry(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, countryId: null, countryName: '' })}
        onConfirm={confirmDeleteCountry}
        title="Delete Country"
        message={`Are you sure you want to delete "${deleteModal.countryName}"? This action cannot be undone.`}
        confirmText="Delete Country"
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

// Country Edit Modal Component
interface CountryEditModalProps {
  country: Country;
  onSave: (country: Country) => void;
  onClose: () => void;
}

function CountryEditModal({ country, onSave, onClose }: CountryEditModalProps) {
  const [formData, setFormData] = useState<Country>(country);
  const [universities, setUniversities] = useState<UniversityDetail[]>(country.topInstitutes || []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      topInstitutes: universities
    });
  };

  const handleChange = (field: keyof Country, value: any) => {
    setFormData((prev: Country) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (parent: keyof Country, field: string, value: any) => {
    setFormData((prev: Country) => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as any),
        [field]: value
      }
    }));
  };

  const addUniversity = () => {
    const newUniversity: UniversityDetail = {
      _id: `uni-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: 'New University',
      ranking: 1,
      website: '',
      popularPrograms: [],
      admissionCriteria: {
        gpa: 0,
        gre: 0,
        ielts: 0,
        toefl: 0
      },
      averageSalary: {
        masters: '$0',
        phd: '$0'
      }
    };
    setUniversities(prev => [...prev, newUniversity]);
  };

  const removeUniversity = (index: number) => {
    setUniversities(prev => prev.filter((_, i) => i !== index));
  };

  const updateUniversity = (index: number, field: keyof UniversityDetail, value: any) => {
    const newUniversities = [...universities];
    newUniversities[index] = {
      ...newUniversities[index],
      [field]: value
    };
    setUniversities(newUniversities);
  };

  const addVisaRequirement = () => {
    setFormData((prev: Country) => ({
      ...prev,
      visaRequirements: [...(prev.visaRequirements || []), 'New visa requirement']
    }));
  };

  const removeVisaRequirement = (index: number) => {
    setFormData((prev: Country) => ({
      ...prev,
      visaRequirements: (prev.visaRequirements || []).filter((_, i) => i !== index)
    }));
  };

  const getUniversityKey = (uni: UniversityDetail, index: number): string => {
    return uni._id || `university-${index}-${uni.name.substring(0, 10)}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Edit {country.name}</h3>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Basic Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country Code</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => handleChange('code', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="US, UK, CA, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Flag Emoji</label>
              <input
                type="text"
                value={formData.flag || ''}
                onChange={(e) => handleChange('flag', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="🇺🇸, 🇬🇧, 🇨🇦, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Popularity</label>
              <select
                value={formData.popularity || ''}
                onChange={(e) => handleChange('popularity', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select popularity</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Cost</label>
              <input
                type="text"
                value={formData.costOfLiving?.monthly || ''}
                onChange={(e) => handleNestedChange('costOfLiving', 'monthly', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="$1,000 - $2,000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Yearly Cost</label>
              <input
                type="text"
                value={formData.costOfLiving?.yearly || ''}
                onChange={(e) => handleNestedChange('costOfLiving', 'yearly', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="$12,000 - $24,000"
              />
            </div>
          </div>

          {/* Visa Requirements */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Visa Requirements ({(formData.visaRequirements || []).length})</h4>
              <button
                type="button"
                onClick={addVisaRequirement}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add Requirement
              </button>
            </div>
            <div className="space-y-2">
              {(formData.visaRequirements || []).map((requirement: string, index: number) => (
                <div key={`visa-req-${index}-${requirement.substring(0, 10)}`} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={requirement}
                    onChange={(e) => {
                      const newRequirements = [...(formData.visaRequirements || [])];
                      newRequirements[index] = e.target.value;
                      handleChange('visaRequirements', newRequirements);
                    }}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => removeVisaRequirement(index)}
                    className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Universities */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Top Institutes ({universities.length})</h4>
              <button
                type="button"
                onClick={addUniversity}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Add University
              </button>
            </div>
            <div className="space-y-4">
              {universities.map((uni: UniversityDetail, index: number) => (
                <div key={getUniversityKey(uni, index)} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h5 className="font-medium text-gray-900">University #{index + 1}</h5>
                    <button
                      type="button"
                      onClick={() => removeUniversity(index)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">University Name</label>
                      <input
                        type="text"
                        value={uni.name}
                        onChange={(e) => updateUniversity(index, 'name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ranking</label>
                      <input
                        type="number"
                        value={uni.ranking}
                        onChange={(e) => updateUniversity(index, 'ranking', parseInt(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={uni.website}
                        onChange={(e) => updateUniversity(index, 'website', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Popular Programs</label>
                      <textarea
                        value={uni.popularPrograms?.join(', ') || ''}
                        onChange={(e) => updateUniversity(index, 'popularPrograms', e.target.value.split(',').map((p: string) => p.trim()))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Computer Science, Business, Engineering"
                        rows={2}
                      />
                    </div>
                  </div>
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