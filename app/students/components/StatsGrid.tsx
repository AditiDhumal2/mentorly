// components/StatsGrid.tsx
interface StatsGridProps {
  roadmapProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  brandingProgress: {
    completed: number;
    total: number;
    percentage: number;
  };
  savedResources: number;
  currentYear: number;
}

export default function StatsGrid({ roadmapProgress, brandingProgress, savedResources, currentYear }: StatsGridProps) {
  const stats = [
    {
      title: 'Roadmap Progress',
      value: `${roadmapProgress.percentage}%`,
      description: `${roadmapProgress.completed}/${roadmapProgress.total} steps completed`,
      icon: '🗺️',
      color: 'cyan',
      progress: roadmapProgress.percentage
    },
    {
      title: 'Branding Progress',
      value: `${brandingProgress.percentage}%`,
      description: `${brandingProgress.completed}/${brandingProgress.total} tasks completed`,
      icon: '⭐',
      color: 'blue',
      progress: brandingProgress.percentage
    },
    {
      title: 'Saved Resources',
      value: savedResources.toString(),
      description: 'Learning materials saved',
      icon: '📚',
      color: 'purple',
      progress: Math.min((savedResources / 20) * 100, 100)
    },
    {
      title: 'Current Year',
      value: `Year ${currentYear}`,
      description: 'Your academic year',
      icon: '🎓',
      color: 'green',
      progress: Math.min((currentYear / 4) * 100, 100)
    }
  ];

  const getColorClasses = (color: string) => {
    const classes = {
      cyan: 'from-cyan-500 to-blue-500',
      blue: 'from-blue-500 to-cyan-500',
      purple: 'from-purple-500 to-pink-500',
      green: 'from-green-500 to-emerald-500'
    };
    return classes[color as keyof typeof classes] || classes.cyan;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group cursor-pointer"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getColorClasses(stat.color)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-gray-400 text-xs mt-1">{stat.description}</div>
            </div>
          </div>
          
          <h3 className="font-semibold text-white mb-3 text-sm">{stat.title}</h3>
          
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses(stat.color)} transition-all duration-1000 ease-out`}
              style={{ width: `${stat.progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress</span>
            <span>{stat.progress}%</span>
          </div>
        </div>
      ))}
    </div>
  );
}