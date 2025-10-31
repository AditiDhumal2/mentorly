import { ResourceResponse } from '@/types/resource';
import SaveResourceButton from './SaveResourceButton';

interface ResourceCardProps {
  resource: ResourceResponse;
}

export default function ResourceCard({ resource }: ResourceCardProps) {
  const getTypeColor = (type: string) => {
    const colors = {
      course: 'bg-green-100 text-green-800 border-green-200',
      internship: 'bg-blue-100 text-blue-800 border-blue-200',
      portal: 'bg-orange-100 text-orange-800 border-orange-200',
      newsletter: 'bg-purple-100 text-purple-800 border-purple-200',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-emerald-100 text-emerald-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 pr-4">
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {resource.title}
          </h3>
          <p className="text-gray-600 text-sm mt-1 line-clamp-2">
            {resource.description}
          </p>
        </div>
        <SaveResourceButton resourceId={resource._id} />
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getTypeColor(resource.type)}`}>
          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
        </span>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(resource.level)}`}>
          {resource.level}
        </span>
        {resource.free && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Free
          </span>
        )}
        {resource.certificate && (
          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Certificate
          </span>
        )}
      </div>

      {/* Tags */}
      {resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.slice(0, 3).map((tag: string, index: number) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
              +{resource.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Action Button */}
      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
      >
        Access Resource
        <div className="text-xs text-blue-200 mt-1">
          {formatUrl(resource.url)}
        </div>
      </a>
    </div>
  );
}