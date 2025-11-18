'use client';

import { useState, useEffect } from 'react';
import { Moderator } from '@/types/community';
import { searchUsersForModeration, assignModerator } from '@/actions/moderator-actions';
import Snackbar from '@/components/Snackbar';

interface AssignModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModeratorAssigned: (moderator: Moderator) => void;
  existingModerators: Moderator[];
}

const CATEGORIES = [
  { id: 'higher-education', name: 'Higher Education' },
  { id: 'market-trends', name: 'Market Trends' },
  { id: 'domains', name: 'Domains & Specializations' },
  { id: 'placements', name: 'Placements & Careers' },
  { id: 'general', name: 'General Discussion' },
  { id: 'academic', name: 'Academic Help' },
  { id: 'career', name: 'Career Advice' },
  { id: 'technical', name: 'Technical Help' },
  { id: 'announcement', name: 'Announcements' }
];

export default function AssignModeratorModal({
  isOpen,
  onClose,
  onModeratorAssigned,
  existingModerators
}: AssignModeratorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    if (searchQuery.length > 2) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const results = await searchUsersForModeration(searchQuery);
      // Filter out users who are already moderators
      const filteredResults = results.filter(user => 
        !existingModerators.some(mod => mod.userId === user.id)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      setSnackbar({
        open: true,
        message: 'Error searching users',
        severity: 'error'
      });
    } finally {
      setSearching(false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedUser || selectedCategories.length === 0) {
      setSnackbar({
        open: true,
        message: 'Please select a user and at least one category',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const result = await assignModerator(
        selectedUser.id,
        selectedUser.name,
        selectedUser.role,
        selectedCategories
      );

      if (result.success) {
        const newModerator: Moderator = {
          _id: Date.now().toString(), // Temporary ID
          userId: selectedUser.id,
          userName: selectedUser.name,
          userRole: selectedUser.role,
          assignedCategories: selectedCategories,
          permissions: {
            canDeletePosts: true,
            canDeleteReplies: true,
            canManageReports: true,
            canViewAllContent: true
          },
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        onModeratorAssigned(newModerator);
        resetForm();
        setSnackbar({
          open: true,
          message: 'Moderator assigned successfully',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to assign moderator',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error assigning moderator:', error);
      setSnackbar({
        open: true,
        message: 'Failed to assign moderator',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedUser(null);
    setSelectedCategories([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Assign Moderator</h2>

            {/* User Search */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search User
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name or email..."
              />
              
              {/* Search Results */}
              {searching && (
                <div className="mt-2 text-sm text-gray-500">Searching...</div>
              )}
              
              {searchResults.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                        selectedUser?.id === user.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">{user.name}</div>
                          <div className="text-sm text-gray-600">{user.email}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          user.role === 'student' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedUser && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium text-green-800">Selected: {selectedUser.name}</div>
                      <div className="text-sm text-green-600">{selectedUser.email} • {selectedUser.role}</div>
                    </div>
                    <button
                      onClick={() => setSelectedUser(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Change
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Category Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Categories to Moderate
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CATEGORIES.map(category => (
                  <label
                    key={category.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategories.includes(category.id)
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="mr-3 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="font-medium">{category.name}</span>
                  </label>
                ))}
              </div>
              {selectedCategories.length > 0 && (
                <div className="mt-3 text-sm text-gray-600">
                  Selected {selectedCategories.length} categor{selectedCategories.length === 1 ? 'y' : 'ies'}
                </div>
              )}
            </div>

            {/* Permissions Info */}
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Moderator Permissions</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>✓ Delete inappropriate posts and replies</li>
                <li>✓ Manage reported content in assigned categories</li>
                <li>✓ View all content in assigned categories</li>
                <li>✓ Cannot access admin-only sections</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedUser || selectedCategories.length === 0 || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Assigning...' : 'Assign Moderator'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
}