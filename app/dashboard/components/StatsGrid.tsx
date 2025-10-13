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
      color: 'cyan'
    },
    {
      title: 'Branding Progress',
      value: `${brandingProgress.percentage}%`,
      description: `${brandingProgress.completed}/${brandingProgress.total} tasks completed`,
      icon: '⭐',
      color: 'blue'
    },
    {
      title: 'Saved Resources',
      value: savedResources.toString(),
      description: 'Learning materials saved',
      icon: '📚',
      color: 'purple'
    },
    {
      title: 'Current Year',
      value: `Year ${currentYear}`,
      description: 'Your academic year',
      icon: '🎓',
      color: 'green'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="bg-gray-800/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-700/60 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-cyan-400/30 group"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl ${
              stat.color === 'cyan' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-400/30' :
              stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30' :
              stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border border-purple-400/30' :
              'bg-green-500/20 text-green-400 border border-green-400/30'
            } flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
              <span className="text-lg">{stat.icon}</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
          <p className="text-gray-300 font-medium text-sm mb-2">{stat.title}</p>
          <p className="text-gray-400 text-xs">{stat.description}</p>
        </div>
      ))}
    </div>
  );
}