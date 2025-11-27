// app/mentors/dashboard/components/StatsOverview.tsx
import { DashboardStats } from '@/types';

interface StatsOverviewProps {
  stats: DashboardStats;
}

export default function StatsOverview({ stats }: StatsOverviewProps) {
  const statCards = [
    {
      title: 'Upcoming Sessions',
      value: stats.upcomingSessions,
      icon: (
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'blue',
      description: stats.upcomingSessions > 0 ? `${stats.upcomingSessions} scheduled` : 'No upcoming sessions'
    },
    {
      title: 'Students Helped',
      value: stats.studentsHelped,
      icon: (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: 'green',
      description: stats.studentsHelped > 0 ? 'Active mentorship' : 'Be the first to help!'
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: (
        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      color: 'orange',
      description: stats.pendingRequests > 0 ? 'Needs your attention' : 'All caught up!'
    },
    {
      title: 'Total Earnings',
      value: `₹${stats.totalEarnings}`,
      icon: (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'purple',
      description: stats.totalEarnings > 0 ? 'From completed sessions' : 'Start earning today'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
      green: { bg: 'bg-green-100', text: 'text-green-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
      purple: { bg: 'bg-purple-100', text: 'text-purple-600' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const colorClasses = getColorClasses(stat.color);
        return (
          <div key={index} className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${colorClasses.bg} rounded-xl flex items-center justify-center`}>
                {stat.icon}
              </div>
            </div>
            <div className={`mt-3 text-xs font-medium ${
              stat.color === 'orange' && stats.pendingRequests > 0 ? 'text-orange-600' :
              stat.color === 'blue' && stats.upcomingSessions > 0 ? 'text-green-600' :
              stat.color === 'purple' && stats.totalEarnings > 0 ? 'text-green-600' :
              'text-gray-500'
            }`}>
              {stat.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}