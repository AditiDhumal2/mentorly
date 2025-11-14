'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { getAllExpertiseOptions } from '@/actions/students-mentorselect-actions';

interface MentorFiltersProps {
  searchQuery: string;
  filters: {
    expertise: string[];
    minExperience: number;
    maxExperience: number;
    minRating: number;
  };
  onSearchChange: (query: string) => void;
  onFiltersChange: (filters: any) => void;
}

export default function MentorFilters({
  searchQuery,
  filters,
  onSearchChange,
  onFiltersChange
}: MentorFiltersProps) {
  const [expertiseOptions, setExpertiseOptions] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const loadExpertiseOptions = async () => {
      const result = await getAllExpertiseOptions();
      if (result.success) {
        setExpertiseOptions(result.expertise);
      }
    };
    loadExpertiseOptions();
  }, []);

  const handleExpertiseToggle = (expertise: string) => {
    const updatedExpertise = filters.expertise.includes(expertise)
      ? filters.expertise.filter(e => e !== expertise)
      : [...filters.expertise, expertise];
    
    onFiltersChange({ ...filters, expertise: updatedExpertise });
  };

  const clearFilters = () => {
    onFiltersChange({
      expertise: [],
      minExperience: 0,
      maxExperience: 0,
      minRating: 0
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="relative mb-4">
        <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search mentors by name, college, or skills..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
        >
          <Filter className="w-5 h-5" />
          <span>Filters</span>
          {(filters.expertise.length > 0 || filters.minExperience > 0 || filters.minRating > 0) && (
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </button>
        
        {(filters.expertise.length > 0 || filters.minExperience > 0 || filters.minRating > 0) && (
          <button
            onClick={clearFilters}
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-200">
          {/* Expertise Filter */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Expertise</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {expertiseOptions.map((expertise) => (
                <label key={expertise} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.expertise.includes(expertise)}
                    onChange={() => handleExpertiseToggle(expertise)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{expertise}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Experience Filter */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Experience (years)</h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Min Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={filters.minExperience}
                  onChange={(e) => onFiltersChange({ ...filters, minExperience: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Max Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={filters.maxExperience}
                  onChange={(e) => onFiltersChange({ ...filters, maxExperience: parseInt(e.target.value) || 0 })}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Minimum Rating</h4>
            <div className="space-y-2">
              {[4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="minRating"
                    checked={filters.minRating === rating}
                    onChange={() => onFiltersChange({ ...filters, minRating: rating })}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    {rating}+ stars
                  </span>
                </label>
              ))}
              <label className="flex items-center space-x-2">
                <input
                  type="radio"
                  name="minRating"
                  checked={filters.minRating === 0}
                  onChange={() => onFiltersChange({ ...filters, minRating: 0 })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Any rating</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}