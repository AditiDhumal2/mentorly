import { ResourceResponse } from '@/types/resource';

interface ResourceCardProps {
  resource: ResourceResponse;
  onEdit: (resource: ResourceResponse) => void;
  onDelete: (resourceId: string) => void;
}

export default function ResourceCard({ resource, onEdit, onDelete }: ResourceCardProps) {
  const getTypeColor = (type: string) => {
    const colors = {
      course: 'bg-green-100 text-green-800',
      internship: 'bg-blue-100 text-blue-800',
      portal: 'bg-orange-100 text-orange-800',
      newsletter: 'bg-purple-100 text-purple-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-emerald-100 text-emerald-800',
      intermediate: 'bg-yellow-100 text-yellow-800',
      advanced: 'bg-red-100 text-red-800',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-800 flex-1 pr-2">{resource.title}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(resource)}
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(resource._id)}
            className="text-red-600 hover:text-red-800 text-sm font-medium"
          >
            Delete
          </button>
        </div>
      </div>

      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(resource.type)}`}>
          {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(resource.level)}`}>
          {resource.level}
        </span>
        {resource.free && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Free
          </span>
        )}
        {resource.certificate && (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Certificate
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {resource.tags.map((tag: string, index: number) => (
          <span
            key={index}
            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-xs text-gray-500 mb-2">
        {resource.createdAt && `Created: ${formatDate(resource.createdAt)}`}
        {resource.addedBy && ` • By: ${resource.addedBy.name}`}
      </div>

      <a
        href={resource.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-purple-600 hover:text-purple-800 text-sm font-medium block truncate"
      >
        {resource.url}
      </a>
    </div>
  );
}