// app/admin/roadmap/components/RoadmapControls.tsx
'use client';

import { Language } from '@/lib/languages';

interface RoadmapControlsProps {
  selectedYear: number;
  selectedLanguage: string;
  onYearChange: (year: number) => void;
  onLanguageChange: (language: string) => void;
  onAddStep: () => void;
  languages: Language[];
}

export default function RoadmapControls({
  selectedYear,
  selectedLanguage,
  onYearChange,
  onLanguageChange,
  onAddStep,
  languages
}: RoadmapControlsProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Academic Year
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[1, 2, 3, 4].map(year => (
              <option key={year} value={year}>Year {year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Programming Language
          </label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {languages.map(language => (
              <option key={language.id} value={language.id}>
                {language.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={onAddStep}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add New Step
          </button>
        </div>
      </div>
    </div>
  );
}