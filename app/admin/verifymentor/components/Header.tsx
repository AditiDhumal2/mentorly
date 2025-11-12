// app/admin/verifymentor/components/Header.tsx
'use client';

interface HeaderProps {
  mentorsCount: number;
  selectedCount: number;
  onRefresh: () => void;
}

export default function Header({ mentorsCount, selectedCount, onRefresh }: HeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">Mentor Verification</h1>
      <p className="text-gray-600 mt-2">
        Review and approve mentor applications to maintain platform quality
      </p>
      
      <div className="mt-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Pending Applications ({mentorsCount})
          </h2>
          {selectedCount > 0 && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedCount} selected
            </p>
          )}
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Refresh
        </button>
      </div>
    </div>
  );
}