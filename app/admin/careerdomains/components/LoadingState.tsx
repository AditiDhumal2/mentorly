import { Target } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Loading Career Domains</h3>
        <p className="text-gray-600 mt-1">Please wait while we fetch the data...</p>
      </div>
    </div>
  );
}