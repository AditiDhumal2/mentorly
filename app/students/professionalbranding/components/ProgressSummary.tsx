// app/students/professionalbranding/components/ProgressSummary.tsx
import { BrandingProgressStats } from '@/types/professionalBranding';
import { motivationalQuotes } from '@/utils/professional-branding-utils';

interface ProgressSummaryProps {
  progress: BrandingProgressStats;
}

export function ProgressSummary({ progress }: ProgressSummaryProps) {
  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Progress Overview</h2>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Overall Progress</span>
            <span>{progress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{progress.completed}</div>
            <div className="text-sm text-blue-800">Completed</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-600">{progress.total}</div>
            <div className="text-sm text-purple-800">Total Tasks</div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <p className="text-sm text-yellow-800 italic">"{randomQuote}"</p>
        </div>
      </div>
    </div>
  );
}