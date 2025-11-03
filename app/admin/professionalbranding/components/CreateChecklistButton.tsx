// app/admin/professionalbranding/components/CreateChecklistButton.tsx
'use client';

import { useState } from 'react';
import { CreateChecklistModal } from './CreateChecklistModal';

export function CreateChecklistButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Create New Checklist
      </button>

      <CreateChecklistModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}