import { Target, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  type?: 'default' | 'search';
  title?: string;
  description?: string;
}

export default function EmptyState({ 
  type = 'default', 
  title, 
  description 
}: EmptyStateProps) {
  if (type === 'search') {
    return (
      <div className="text-center py-12 bg-white/50 rounded-2xl border border-gray-200">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {title || 'No domains found'}
        </h3>
        <p className="text-gray-600">
          {description || 'Try adjusting your search terms to find what you\'re looking for.'}
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 bg-white/50 rounded-2xl border-2 border-dashed border-gray-300">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Target className="w-10 h-10 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {title || 'No Career Domains Yet'}
      </h3>
      <p className="text-gray-600 max-w-md mx-auto mb-6">
        {description || 'Get started by creating your first career domain. Define skills, salary ranges, and career paths to help students explore opportunities.'}
      </p>
      <button className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
        <Plus className="w-4 h-4" />
        <span>Create First Domain</span>
      </button>
    </div>
  );
}