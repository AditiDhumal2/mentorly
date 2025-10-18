interface StatItem {
  title: string;
  count: number | string;
  icon: string;
  color: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.title} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className={`p-3 ${stat.color.split(' ')[0]} rounded-lg`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}