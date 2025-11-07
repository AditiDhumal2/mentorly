// app/admin/highereducation/components/AdminStats.tsx
'use client';

interface AdminStatsProps {
  higherEdData: any;
  studentProgress: any[];
}

export default function AdminStats({ higherEdData, studentProgress }: AdminStatsProps) {
  const stats = [
    {
      title: 'Countries',
      value: higherEdData?.countries?.length || 0,
      description: 'Study destinations',
      color: 'bg-blue-500',
      icon: '🌍'
    },
    {
      title: 'Exams',
      value: higherEdData?.examPreparations?.length || 0,
      description: 'Preparation guides',
      color: 'bg-green-500',
      icon: '📝'
    },
    {
      title: 'Documents',
      value: higherEdData?.applicationDocuments?.length || 0,
      description: 'Application templates',
      color: 'bg-purple-500',
      icon: '📄'
    },
    {
      title: 'Active Students',
      value: studentProgress.length,
      description: 'Tracking progress',
      color: 'bg-orange-500',
      icon: '👨‍🎓'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            </div>
            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-lg">{stat.icon}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}