// app/mentors/dashboard/components/RecentActivities.tsx
import { Activity } from '@/types';

interface RecentActivitiesProps {
  activities: Activity[];
}

export default function RecentActivities({ activities }: RecentActivitiesProps) {
  const getStatusColor = (status: string) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      unread: 'bg-blue-100 text-blue-800',
      positive: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      scheduled: 'bg-blue-100 text-blue-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatActivityTime = (timestamp: string): string => {
    try {
      const now = new Date();
      const activityTime = new Date(timestamp);
      const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours} hours ago`;
      if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} days ago`;
      return activityTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch (error) {
      return 'Recently';
    }
  };

  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-lg mb-2">No recent activity</div>
          <p className="text-gray-500 text-sm">Your recent activities will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
              {activity.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(activity.status)}`}>
                  {activity.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.student}</p>
              <p className="text-xs text-gray-500 mt-1">{formatActivityTime(activity.timestamp)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}