interface ProgressChartProps {
  roadmapProgress: {
    percentage: number;
  };
  brandingProgress: {
    percentage: number;
  };
}

export default function ProgressChart({ roadmapProgress, brandingProgress }: ProgressChartProps) {
  return (
    <div className="bg-gray-800/80 backdrop-blur-lg rounded-2xl shadow-lg border border-gray-700/60 p-6">
      <h2 className="text-xl font-bold text-white mb-6 flex items-center">
        <span className="text-blue-400 mr-2">📊</span>
        Progress Overview
      </h2>
      <div className="space-y-6">
        {/* Roadmap Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-cyan-400 font-medium text-sm">Roadmap Progress</span>
            <span className="text-white font-bold">{roadmapProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${roadmapProgress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Branding Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-yellow-400 font-medium text-sm">Branding Progress</span>
            <span className="text-white font-bold">{brandingProgress.percentage}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-yellow-500 to-orange-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${brandingProgress.percentage}%` }}
            ></div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-green-400 font-medium text-sm">Overall Progress</span>
            <span className="text-white font-bold">
              {Math.round((roadmapProgress.percentage + brandingProgress.percentage) / 2)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${Math.round((roadmapProgress.percentage + brandingProgress.percentage) / 2)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
}