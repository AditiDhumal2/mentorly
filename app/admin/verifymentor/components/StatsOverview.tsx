// app/admin/verifymentor/components/StatsOverview.tsx
interface StatsOverviewProps {
  stats: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    recentApplications: number;
  };
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Total Mentors',
      value: stats.total,
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      description: 'All registered mentors'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      description: 'Awaiting approval'
    },
    {
      title: 'Approved',
      value: stats.approved,
      color: 'bg-green-500',
      textColor: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      description: 'Active mentors'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      color: 'bg-red-500',
      textColor: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      description: 'Not approved'
    },
    {
      title: 'Recent Applications',
      value: stats.recentApplications,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      description: 'Last 7 days'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
      {statCards.map((stat, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-lg border-2 ${stat.borderColor} p-4 hover:shadow-md transition-all duration-200 hover:scale-105`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                {stat.title}
              </p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {stat.description}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-full flex items-center justify-center ml-3`}>
              <div className={`w-8 h-8 ${stat.color} rounded-full flex items-center justify-center`}>
                <span className="text-white text-sm font-bold">{stat.value}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}