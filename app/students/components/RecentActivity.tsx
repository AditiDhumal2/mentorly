interface Activity {
  type: string;
  title: string;
  time: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getActivityConfig = (type: string) => {
    const configs = {
      roadmap: {
        icon: '🗺️',
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        gradient: 'from-blue-500 to-cyan-500',
      },
      branding: {
        icon: '⭐',
        color: 'text-green-600 bg-green-50 border-green-200',
        gradient: 'from-green-500 to-emerald-500',
      },
      resource: {
        icon: '📚',
        color: 'text-purple-600 bg-purple-50 border-purple-200',
        gradient: 'from-purple-500 to-pink-500',
      },
      account: {
        icon: '👤',
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        gradient: 'from-orange-500 to-red-500',
      },
      welcome: {
        icon: '🎉',
        color: 'text-pink-600 bg-pink-50 border-pink-200',
        gradient: 'from-pink-500 to-rose-500',
      },
      default: {
        icon: '📝',
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        gradient: 'from-gray-500 to-gray-600',
      }
    };

    return configs[type as keyof typeof configs] || configs.default;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-green-500 mr-2">📋</span>
        Recent Activity
      </h2>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => {
            const config = getActivityConfig(activity.type);
            return (
              <div 
                key={index} 
                className="flex items-center space-x-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${config.color} group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-lg">{config.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 group-hover:text-gray-700 transition-colors">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <span>🕒</span>
                    <span>{activity.time}</span>
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <div className={`w-2 h-2 bg-gradient-to-r ${config.gradient} rounded-full`}></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-gray-400">📝</span>
            </div>
            <p className="text-gray-500 mb-2">No recent activity</p>
            <p className="text-sm text-gray-400">Start exploring the platform to see your activity here!</p>
          </div>
        )}
      </div>
      
      {/* View All Button */}
      {activities.length > 0 && (
        <button className="w-full mt-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-inner">
          View All Activity
        </button>
      )}
    </div>
  );
}