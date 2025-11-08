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
      description: 'All registered mentors'
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      color: 'bg-yellow-500',
      description: 'Awaiting approval'
    },
    {
      title: 'Approved',
      value: stats.approved,
      color: 'bg-green-500',
      description: 'Active mentors'
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      color: 'bg-red-500',
      description: 'Not approved'
    },
    {
      title: 'Recent Applications',
      value: stats.recentApplications,
      color: 'bg-purple-500',
      description: 'Last 7 days'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white mr-4`}>
              <span className="text-lg font-bold">{stat.value}</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">{stat.title}</h3>
              <p className="text-xs text-gray-500">{stat.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}