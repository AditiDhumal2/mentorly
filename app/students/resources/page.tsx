import { getResourcesAction, getResourceTagsAction } from '@/actions/student-resource-actions';
import ResourceFilters from './components/ResourceFilters';
import ResourceCard from './components/ResourceCard';
import { ResourceResponse, ResourceFilters as ResourceFiltersType } from '@/types/resource';

interface ResourcesPageProps {
  searchParams: Promise<{
    type?: string;
    level?: string;
    free?: string;
    tags?: string;
    page?: string;
  }>;
}

export default async function StudentResourcesPage({ searchParams }: ResourcesPageProps) {
  // Await searchParams in Next.js 15
  const params = await searchParams;
  
  // Parse filters from search params
  const filters: ResourceFiltersType = {
    type: params.type || 'all',
    level: params.level || 'all',
    free: params.free || 'all',
    tags: params.tags ? params.tags.split(',') : [],
  };

  const currentPage = parseInt(params.page || '1');
  const resourcesPerPage = 9;

  // Fetch data on the server
  const [resourcesResult, tagsResult] = await Promise.all([
    getResourcesAction({
      type: filters.type !== 'all' ? filters.type : undefined,
      level: filters.level !== 'all' ? filters.level : undefined,
      free: filters.free !== 'all' ? (filters.free === 'free') : undefined,
      tags: filters.tags.length > 0 ? filters.tags : undefined,
    }),
    getResourceTagsAction(),
  ]);

  const resources = resourcesResult.success ? resourcesResult.resources || [] : [];
  const availableTags = tagsResult.success ? tagsResult.data || [] : [];

  // Apply pagination
  const indexOfLastResource = currentPage * resourcesPerPage;
  const indexOfFirstResource = indexOfLastResource - resourcesPerPage;
  const currentResources = resources.slice(indexOfFirstResource, indexOfLastResource);
  const totalPages = Math.ceil(resources.length / resourcesPerPage);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold">Learning Resources & Portals</h1>
            <p className="text-blue-100 mt-2 text-lg">
              Access verified free learning materials, internships, and job portals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 -mt-4">
        <div className="space-y-6">
          {/* Stats Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resources Overview</h3>
                <p className="text-gray-600 text-sm mt-1">
                  Showing {currentResources.length} of {resources.length} resources
                </p>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{resources.length}</div>
                  <div className="text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {resources.filter(r => r.free).length}
                  </div>
                  <div className="text-gray-600">Free</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {resources.filter(r => r.certificate).length}
                  </div>
                  <div className="text-gray-600">Certified</div>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {(filters.type !== 'all' || filters.level !== 'all' || filters.free !== 'all' || filters.tags.length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                {filters.type !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Type: {filters.type}
                    <a
                      href={getUpdatedUrl(params, { type: null })}
                      className="ml-1 hover:text-blue-900"
                    >
                      ×
                    </a>
                  </span>
                )}
                {filters.level !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Level: {filters.level}
                    <a
                      href={getUpdatedUrl(params, { level: null })}
                      className="ml-1 hover:text-green-900"
                    >
                      ×
                    </a>
                  </span>
                )}
                {filters.free !== 'all' && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {filters.free === 'free' ? 'Free Only' : 'Paid Only'}
                    <a
                      href={getUpdatedUrl(params, { free: null })}
                      className="ml-1 hover:text-purple-900"
                    >
                      ×
                    </a>
                  </span>
                )}
                {filters.tags.map((tag: string) => (
                  <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {tag}
                    <a
                      href={getUpdatedUrl(params, { 
                        tags: filters.tags.filter(t => t !== tag).join(',') || null 
                      })}
                      className="ml-1 hover:text-gray-900"
                    >
                      ×
                    </a>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Horizontal Filters Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
              {(filters.type !== 'all' || filters.level !== 'all' || filters.free !== 'all' || filters.tags.length > 0) && (
                <a
                  href="/students/resources"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </a>
              )}
            </div>
            
            <ResourceFilters 
              currentFilters={filters} 
              availableTags={availableTags} 
            />
          </div>

          {/* Resources Grid */}
          {currentResources.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600 mb-6">
                  {resources.length === 0 
                    ? 'No resources have been added yet.' 
                    : 'No resources match your current filters.'
                  }
                </p>
                {(filters.type !== 'all' || filters.level !== 'all' || filters.free !== 'all' || filters.tags.length > 0) ? (
                  <a
                    href="/students/resources"
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium inline-block"
                  >
                    Clear Filters
                  </a>
                ) : (
                  <div className="text-sm text-gray-500">
                    Check back later for new resources
                  </div>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {currentResources.map((resource: ResourceResponse) => (
                  <ResourceCard
                    key={resource._id}
                    resource={resource}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center space-x-2">
                  <a
                    href={getUpdatedUrl(params, { page: (currentPage - 1).toString() })}
                    className={`px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium ${
                      currentPage === 1 ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    Previous
                  </a>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <a
                      key={page}
                      href={getUpdatedUrl(params, { page: page.toString() })}
                      className={`px-4 py-2 rounded-lg font-medium ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </a>
                  ))}
                  
                  <a
                    href={getUpdatedUrl(params, { page: (currentPage + 1).toString() })}
                    className={`px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium ${
                      currentPage === totalPages ? 'opacity-50 pointer-events-none' : ''
                    }`}
                  >
                    Next
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper function to build updated URLs
function getUpdatedUrl(currentParams: Record<string, string | undefined>, updates: Record<string, string | null>) {
  const params = new URLSearchParams();
  
  // Add existing params
  if (currentParams.type && currentParams.type !== 'all') params.set('type', currentParams.type);
  if (currentParams.level && currentParams.level !== 'all') params.set('level', currentParams.level);
  if (currentParams.free && currentParams.free !== 'all') params.set('free', currentParams.free);
  if (currentParams.tags) params.set('tags', currentParams.tags);
  if (currentParams.page && currentParams.page !== '1') params.set('page', currentParams.page);

  // Apply updates
  Object.entries(updates).forEach(([key, value]) => {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  });

  const queryString = params.toString();
  return queryString ? `/students/resources?${queryString}` : '/students/resources';
}