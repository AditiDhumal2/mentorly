'use client';

import { useState } from 'react';
import { Moderator } from '@/types/community';
import AssignModeratorModal from './AssignModeratorModal';
import ModeratorList from './ModeratorList';

interface ModeratorManagementProps {
  initialModerators: Moderator[];
}

export default function ModeratorManagement({ initialModerators }: ModeratorManagementProps) {
  const [moderators, setModerators] = useState<Moderator[]>(initialModerators);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const handleModeratorAssigned = (newModerator: Moderator) => {
    setModerators(prev => [newModerator, ...prev]);
    setIsAssignModalOpen(false);
  };

  const handleModeratorRemoved = (userId: string) => {
    setModerators(prev => prev.filter(mod => mod.userId !== userId));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Moderator Management</h1>
            <p className="text-gray-600 mt-2">
              Assign moderators to manage specific categories in the community forum
            </p>
          </div>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Assign Moderator
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600 mb-2">{moderators.length}</div>
            <div className="text-gray-600">Total Moderators</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {moderators.filter(m => m.userRole === 'student').length}
            </div>
            <div className="text-gray-600">Student Moderators</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {moderators.filter(m => m.userRole === 'mentor').length}
            </div>
            <div className="text-gray-600">Mentor Moderators</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {new Set(moderators.flatMap(m => m.assignedCategories)).size}
            </div>
            <div className="text-gray-600">Categories Covered</div>
          </div>
        </div>

        {/* Moderator List */}
        <ModeratorList 
          moderators={moderators}
          onModeratorRemoved={handleModeratorRemoved}
        />

        {/* Assign Moderator Modal */}
        <AssignModeratorModal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onModeratorAssigned={handleModeratorAssigned}
          existingModerators={moderators}
        />
      </div>
    </div>
  );
}