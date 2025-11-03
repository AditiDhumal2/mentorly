// app/admin/professionalbranding/components/BrandingChecklistTable.tsx
'use client';

import { AdminBrandingChecklist } from '@/types/professionalBranding';
import { useState } from 'react';
import { EditChecklistModal } from './EditChecklistModal';
import { deleteBrandingChecklist } from '@/actions/professionalbranding-admin-actions';

interface BrandingChecklistTableProps {
  checklists: AdminBrandingChecklist[];
}

export function BrandingChecklistTable({ checklists }: BrandingChecklistTableProps) {
  const [editingChecklist, setEditingChecklist] = useState<AdminBrandingChecklist | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDelete = async (year: number, checklistId: string) => {
    if (!confirm('Are you sure you want to delete this checklist? This action cannot be undone.')) {
      return;
    }

    setDeletingId(checklistId);
    try {
      const result = await deleteBrandingChecklist(year);
      if (result.success) {
        alert('Checklist deleted successfully!');
        window.location.reload();
      } else {
        alert(`Failed to delete checklist: ${result.error}`);
      }
    } catch (error) {
      console.error('Error deleting checklist:', error);
      alert('Failed to delete checklist');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Branding Checklists</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {checklists.map((checklist) => (
                <tr key={checklist._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-lg font-semibold text-gray-900">
                      Year {checklist.year}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {checklist.tasks.length} tasks
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {checklist.createdAt ? formatDate(checklist.createdAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {checklist.updatedAt ? formatDate(checklist.updatedAt) : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => setEditingChecklist(checklist)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(checklist.year, checklist._id)}
                      disabled={deletingId === checklist._id}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                    >
                      {deletingId === checklist._id ? 'Deleting...' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {checklists.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No branding checklists found.</p>
              <p className="text-sm text-gray-400 mt-1">Create your first checklist to get started.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingChecklist && (
        <EditChecklistModal
          checklist={editingChecklist}
          isOpen={!!editingChecklist}
          onClose={() => setEditingChecklist(null)}
          onSuccess={() => window.location.reload()}
        />
      )}
    </>
  );
}