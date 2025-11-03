'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createResourceAction, updateResourceAction, deleteResourceAction } from '@/actions/admin-resource-actions';
import ResourceCard from './ResourceCard';
import ResourceForm from './ResourceForm';
import Snackbar from '@/components/Snackbar'; 
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
  const [deletingResourceId, setDeletingResourceId] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showAlert = (message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleCreateResource = async (formData: CreateResourceInput | UpdateResourceInput) => {
    const result = await createResourceAction(formData as CreateResourceInput);
    
    if (result.success && result.resource) {
      setShowForm(false);
      setResources(prev => [...prev, result.resource!]);
      showAlert('Resource created successfully!');
      router.refresh();
    } else {
      showAlert(result.message || 'Failed to create resource', 'error');
    }
  };

  const handleUpdateResource = async (formData: CreateResourceInput | UpdateResourceInput) => {
    if (!editingResource) return;
    
    const result = await updateResourceAction(editingResource._id, formData as UpdateResourceInput);
    if (result.success && result.resource) {
      setEditingResource(null);
      setResources(prev => prev.map(res => 
        res._id === editingResource._id ? result.resource! : res
      ));
      showAlert('Resource updated successfully!');
      router.refresh();
    } else {
      showAlert(result.message || 'Failed to update resource', 'error');
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    setDeletingResourceId(resourceId);
    try {
      const result = await deleteResourceAction(resourceId);
      if (result.success) {
        setResources(prev => prev.filter(res => res._id !== resourceId));
        showAlert('Resource deleted successfully!');
        router.refresh();
      } else {
        showAlert(result.message || 'Failed to delete resource', 'error');
      }
    } catch (error) {
      showAlert('An error occurred while deleting the resource', 'error');
    } finally {
      setDeletingResourceId(null);
    }
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
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
        autoHideDuration={6000} // 6 seconds for deletion messages
      />

      {/* Controls */}
      <div className="flex justify-between items-center mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Types</option>
          <option value="course">Courses</option>
          <option value="internship">Internships</option>
          <option value="portal">Portals</option>
          <option value="newsletter">Newsletters</option>
        </select>

        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Add New Resource
        </button>
      </div>

      {/* Resources Count */}
      <div className="mb-4 text-gray-600">
        Showing {filteredResources.length} of {resources.length} resources
      </div>

      {/* Resources Grid */}
      {filteredResources.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2">No resources found</h3>
          <p className="text-gray-600 mb-6">
            {resources.length === 0 ? 'No resources added yet.' : 'No resources match your filter.'}
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Add Your First Resource
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onEdit={setEditingResource}
              onDelete={handleDeleteResource}
              isDeleting={deletingResourceId === resource._id}
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