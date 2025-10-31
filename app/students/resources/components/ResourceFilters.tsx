'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ResourceFilters as ResourceFiltersType } from '@/types/resource';

interface ResourceFiltersProps {
  currentFilters: ResourceFiltersType;
  availableTags: string[];
}

export default function ResourceFilters({ currentFilters, availableTags }: ResourceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Function to build updated URL
  const getUpdatedUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Apply updates
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    // Always reset to page 1 when filters change
    params.delete('page');

    const queryString = params.toString();
    return queryString ? `/students/resources?${queryString}` : '/students/resources';
  };

  const handleFilterChange = (key: keyof ResourceFiltersType, value: string) => {
    const updates: Record<string, string | null> = {};
    
    if (value === 'all') {
      updates[key] = null;
    } else {
      updates[key] = value;
    }
    
    router.push(getUpdatedUrl(updates));
  };

  const handleTagToggle = (tag: string) => {
    const newTags = currentFilters.tags.includes(tag)
      ? currentFilters.tags.filter((t: string) => t !== tag)
      : [...currentFilters.tags, tag];
    
    const updates: Record<string, string | null> = {
      tags: newTags.length > 0 ? newTags.join(',') : null,
    };
    
    router.push(getUpdatedUrl(updates));
  };

  return (
    <div className="space-y-4">
      {/* Main Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Resource Type</label>
          <select
            value={currentFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="internship">Internships</option>
            <option value="portal">Portals</option>
            <option value="newsletter">Newsletters</option>
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
          <select
            value={currentFilters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>

        {/* Free Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Pricing</label>
          <select
            value={currentFilters.free}
            onChange={(e) => handleFilterChange('free', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          >
            <option value="all">All Resources</option>
            <option value="free">Free Only</option>
            <option value="paid">Paid Only</option>
          </select>
        </div>
      </div>

      {/* Tags Filter Row */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Popular Tags</label>
        <div className="flex flex-wrap gap-2">
          {availableTags.slice(0, 20).map((tag: string) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleTagToggle(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                currentFilters.tags.includes(tag)
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
        {availableTags.length > 20 && (
          <p className="text-xs text-gray-500 mt-2">Showing 20 of {availableTags.length} tags</p>
        )}
      </div>
    </div>
  );
}