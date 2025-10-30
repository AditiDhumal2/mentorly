import { Search, Filter } from 'lucide-react';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
  totalCount: number;
}

export default function SearchFilters({ 
  searchTerm, 
  onSearchChange, 
  resultsCount, 
  totalCount 
}: SearchFiltersProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search career domains, skills, or descriptions..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200">
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
          <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
            {resultsCount} of {totalCount} domains
          </span>
        </div>
      </div>
    </div>
  );
}