// components/messaging/UserSearch.tsx
'use client';

import { useState, useEffect } from 'react';
import { searchUsersAction } from '@/actions/messaging-actions';
import { UserSearchResult } from '@/types/messaging';

interface UserSearchProps {
  currentUserId: string;
  onUserSelect: (user: { id: string; name: string; role: string }) => void;
  onClose: () => void;
  currentUserRole: string;
  showSnackbar: (message: string, severity?: 'success' | 'error') => void;
}

export default function UserSearch({ currentUserId, onUserSelect, onClose, currentUserRole, showSnackbar }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.length < 2) {
        setUsers([]);
        return;
      }

      setLoading(true);
      try {
        const result = await searchUsersAction(query, currentUserId);
        if (result.success && result.users) {
          // Filter out current user and show only relevant users
          const filteredUsers = result.users.filter(user => 
            user._id !== currentUserId
          );
          setUsers(filteredUsers);
        } else {
          showSnackbar(result.error || 'Failed to search users', 'error');
        }
      } catch (error) {
        showSnackbar('Error searching users', 'error');
      }
      setLoading(false);
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query, currentUserId, showSnackbar]);

  const getRoleBadge = (role: string) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800',
      mentor: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs capitalize ${styles[role as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="absolute top-16 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-80 overflow-hidden">
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-gray-900">New Message</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search for ${currentUserRole === 'student' ? 'mentors or students' : 'students or mentors'}...`}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          autoFocus
        />
      </div>
      
      <div className="max-h-60 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500 text-sm">Searching users...</div>
        ) : users.length === 0 && query.length >= 2 ? (
          <div className="p-4 text-center text-gray-500 text-sm">No users found</div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => onUserSelect({
                id: user._id,
                name: user.name,
                role: user.role
              })}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 text-sm">{user.name}</h4>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                {getRoleBadge(user.role)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}