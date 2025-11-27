// app/mentors/dashboard/components/QuickActions.tsx
import Link from 'next/link';

export default function QuickActions() {
  const actions = [
    {
      title: 'Set Availability',
      description: 'Update your schedule',
      href: '/mentors/availability',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'blue'
    },
    {
      title: 'View Sessions',
      description: 'Manage bookings',
      href: '/mentors/sessions',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'green'
    },
    {
      title: 'Messages',
      description: 'Chat with students',
      href: '/mentors/messages',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      ),
      color: 'purple'
    },
    {
      title: 'View Profile',
      description: 'Update information',
      href: '/profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      color: 'orange'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900' },
      green: { bg: 'bg-green-600', hover: 'hover:bg-green-700', light: 'bg-green-50', border: 'border-green-200', text: 'text-green-900' },
      purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-900' },
      orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-900' }
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
        <Link href="/mentors/sessions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, index) => {
          const colorClasses = getColorClasses(action.color);
          return (
            <Link
              key={index}
              href={action.href}
              className={`${colorClasses.light} hover:${colorClasses.light.replace('50', '100')} border ${colorClasses.border} rounded-xl p-4 text-left transition-colors duration-200 group`}
            >
              <div className="flex items-center">
                <div className={`w-10 h-10 ${colorClasses.bg} rounded-lg flex items-center justify-center text-white group-hover:${colorClasses.hover} transition-colors`}>
                  {action.icon}
                </div>
                <div className="ml-3">
                  <div className={`font-semibold ${colorClasses.text}`}>{action.title}</div>
                  <div className={`text-sm ${colorClasses.text.replace('900', '600')}`}>{action.description}</div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}