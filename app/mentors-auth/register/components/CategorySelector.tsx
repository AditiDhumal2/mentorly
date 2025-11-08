// app/mentors-auth/register/components/CategorySelector.tsx
'use client';

import { useState, useEffect } from 'react';
import { MentorCategory, getMentorCategories } from '../actions/mentor-register.actions';

interface Category {
  value: string;
  label: string;
  description: string;
}

interface CategorySelectorProps {
  selectedExpertise: string[]; // Changed from selectedCategories
  onExpertiseChange: (expertise: string[]) => void; // Changed from onCategoriesChange
  error?: string;
}

const categoryIcons: Record<MentorCategory, string> = {
  'higher-education': '🎓',
  'career-domains': '💼',
  'market-trends': '📈',
  'roadmap-guidance': '🗺️',
  'placement-preparation': '🏆',
  'technical-skills': '🔧',
  'study-abroad': '✈️',
  'resume-building': '📄',
  'interview-preparation': '🎯',
  'project-guidance': '🚀'
};

export default function CategorySelector({ 
  selectedExpertise, 
  onExpertiseChange, 
  error 
}: CategorySelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getMentorCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleExpertiseToggle = (category: string) => {
    const newExpertise = selectedExpertise.includes(category)
      ? selectedExpertise.filter(c => c !== category)
      : [...selectedExpertise, category];
    
    onExpertiseChange(newExpertise);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Select Your Mentoring Expertise *
        </label>
        <p className="text-sm text-gray-400 mb-4">
          Choose the areas where you can guide students. You can select multiple categories.
        </p>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <div
            key={category.value}
            onClick={() => handleExpertiseToggle(category.value)}
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
              selectedExpertise.includes(category.value)
                ? 'border-purple-500 bg-purple-500/10 shadow-md'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:shadow-sm'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl flex-shrink-0">
                {categoryIcons[category.value as MentorCategory]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm mb-1">
                  {category.label}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {category.description}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                selectedExpertise.includes(category.value)
                  ? 'bg-purple-500 border-purple-500'
                  : 'border-gray-400'
              }`}>
                {selectedExpertise.includes(category.value) && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center text-sm text-gray-400">
        <svg className="w-4 h-4 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Selected: {selectedExpertise.length} categor{selectedExpertise.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>
    </div>
  );
}