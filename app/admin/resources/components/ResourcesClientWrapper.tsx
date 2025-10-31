'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createResourceAction, updateResourceAction, deleteResourceAction } from '@/actions/admin-resource-actions';
import ResourceCard from './ResourceCard';
import ResourceForm from './ResourceForm';
import { ResourceResponse, CreateResourceInput, UpdateResourceInput } from '@/types/resource';

interface ResourcesClientWrapperProps {
  initialResources: ResourceResponse[];
  loadingError: string;
}

export default function ResourcesClientWrapper({ 
  initialResources, 
  loadingError 
}: ResourcesClientWrapperProps) {
  const router = useRouter();
  const [resources, setResources] = useState<ResourceResponse[]>(initialResources);
  const [showForm, setShowForm] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceResponse | null>(null);
  const [filter, setFilter] = useState('all');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    show: boolean;
    resourceId: string | null;
    resourceName: string;
  }>({
    show: false,
    resourceId: null,
    resourceName: '',
  });

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage(null);
      router.refresh(); // Refresh the page to show updated data
    }, 2000);
  };

  const handleCreateResource = async (formData: CreateResourceInput | UpdateResourceInput) => {
    try {
      const result = await createResourceAction(formData as CreateResourceInput);
      
      if (result.success && result.resource) {
        setShowForm(false);
        setResources(prev => [...prev, result.resource!]);
        showSuccess('Resource created successfully!');
      } else {
        // For errors, you can still use a simple approach or just console.log
        console.error('Failed to create resource:', result.message);
      }
    } catch (error) {
      console.error('Error creating resource:', error);
    }
  };

  const handleUpdateResource = async (formData: CreateResourceInput | UpdateResourceInput) => {
    if (!editingResource) return;
    
    try {
      const result = await updateResourceAction(editingResource._id, formData as UpdateResourceInput);
      if (result.success && result.resource) {
        setEditingResource(null);
        setResources(prev => prev.map(res => 
          res._id === editingResource._id ? result.resource! : res
        ));
        showSuccess('Resource updated successfully!');
      } else {
        console.error('Failed to update resource:', result.message);
      }
    } catch (error) {
      console.error('Error updating resource:', error);
    }
  };

  const handleDeleteClick = (resourceId: string, resourceName: string) => {
    setDeleteConfirmation({
      show: true,
      resourceId,
      resourceName,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmation.resourceId) return;

    try {
      const result = await deleteResourceAction(deleteConfirmation.resourceId);
      if (result.success) {
        setResources(prev => prev.filter(res => res._id !== deleteConfirmation.resourceId));
        showSuccess('Resource deleted successfully!');
      } else {
        console.error('Failed to delete resource:', result.message);
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
    } finally {
      setDeleteConfirmation({
        show: false,
        resourceId: null,
        resourceName: '',
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      show: false,
      resourceId: null,
      resourceName: '',
    });
  };

  const filteredResources = filter === 'all' 
    ? resources 
    : resources.filter(resource => resource.type === filter);

  if (loadingError && resources.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {loadingError}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Success Notification */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 px-6 py-4 rounded-md shadow-lg border-l-4 bg-green-50 border-green-500 text-green-700">
          <div className="flex items-center justify-between">
            <span>✅ {successMessage}</span>
            <button
              onClick={() => setSuccessMessage(null)}
              className="ml-4 text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Confirm Deletion
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{deleteConfirmation.resourceName}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Types</option>
            <option value="course">Courses</option>
            <option value="internship">Internships</option>
            <option value="portal">Portals</option>
            <option value="newsletter">Newsletters</option>
          </select>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
        >
          Add New Resource
        </button>
      </div>

      {/* Resources Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredResources.length} of {resources.length} resources
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 mb-6">
              {resources.length === 0 
                ? 'No resources have been added yet. Click "Add New Resource" to get started.' 
                : 'No resources match your filter.'
              }
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
            >
              Add Your First Resource
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onEdit={setEditingResource}
              onDelete={() => handleDeleteClick(resource._id, resource.title)}
            />
          ))}
        </div>
      )}

      {/* Forms */}
      {showForm && (
        <ResourceForm
          onSave={handleCreateResource}
          onCancel={() => setShowForm(false)}
          isEditing={false}
        />
      )}

      {editingResource && (
        <ResourceForm
          resource={editingResource}
          onSave={handleUpdateResource}
          onCancel={() => setEditingResource(null)}
          isEditing={true}
        />
      )}
    </>
  );
}