import { getAllResourcesAction } from '@/actions/admin-resource-actions';
import ResourcesClientWrapper from './components/ResourcesClientWrapper';
import { ResourceResponse } from '@/types/resource';

export default async function AdminResourcesPage() {
  let resources: ResourceResponse[] = [];
  let loadingError = '';

  try {
    const result = await getAllResourcesAction();
    if (result.success) {
      resources = result.resources || [];
      console.log('✅ Loaded resources:', resources.length);
    } else {
      console.error('Failed to load resources:', result.message);
      loadingError = result.message || 'Failed to load resources';
    }
  } catch (error) {
    console.error('Error loading resources:', error);
    loadingError = 'Error loading resources';
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with pinkish-violet background */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Learning Resources & Portals</h1>
            <p className="text-purple-100 mt-2">Manage all learning resources for students</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <ResourcesClientWrapper 
            initialResources={resources} 
            loadingError={loadingError} 
          />
        </div>
      </div>
    </div>
  );
}