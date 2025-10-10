interface StatsGridProps {
  roadmapProgress: number;
  brandingProgress: number;
  savedResources: number;
  currentYear: number;
}

export default function StatsGrid({ 
  roadmapProgress, 
  brandingProgress, 
  savedResources, 
  currentYear 
}: StatsGridProps) {
  const stats = [
    {
      title: 'Roadmap Progress',
      value: `${roadmapProgress}%`,
      description: 'Learning Path Completed',
      icon: '🗺️',
      color: 'blue',
      progress: roadmapProgress,
    },
    {
      title: 'Branding Progress',
      value: `${brandingProgress}%`,
      description: 'Profile Completion',
      icon: '⭐',
      color: 'green',
      progress: brandingProgress,
    },
    {
      title: 'Saved Resources',
      value: savedResources.toString(),
      description: 'Learning Materials',
      icon: '📚',
      color: 'purple',
    },
    {
      title: 'Current Year',
      value: `Year ${currentYear}`,
      description: 'Academic Journey',
      icon: '🎓',
      color: 'orange',
    },
  ];

  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
      border: 'border-blue-200',
      iconBg: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      progress: 'from-blue-500 to-cyan-500',
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      border: 'border-green-200',
      iconBg: 'bg-gradient-to-r from-green-500 to-emerald-500',
      progress: 'from-green-500 to-emerald-500',
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-pink-50',
      border: 'border-purple-200',
      iconBg: 'bg-gradient-to-r from-purple-500 to-pink-500',
      progress: 'from-purple-500 to-pink-500',
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-red-50',
      border: 'border-orange-200',
      iconBg: 'bg-gradient-to-r from-orange-500 to-red-500',
      progress: 'from-orange-500 to-red-500',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const config = colorConfig[stat.color as keyof typeof colorConfig];
        return (
          <div 
            key={index} 
            className={`${config.bg} border ${config.border} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
              <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center shadow-lg`}>
                <span className="text-xl text-white">{stat.icon}</span>
              </div>
            </div>
            
            {/* Simple Progress Bar for Progress Stats */}
            {'progress' in stat && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-semibold">{stat.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`bg-gradient-to-r ${config.progress} h-2 rounded-full transition-all duration-1000`}
                    style={{ width: `${stat.progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}