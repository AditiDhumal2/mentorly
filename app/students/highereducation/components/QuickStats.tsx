/// app/students/highereducation/components/QuickStats.tsx
'use client';

import { StudentProgress } from '@/types/higher-education';

interface QuickStatsProps {
  studentProgress: StudentProgress | null;
}

export default function QuickStats({ studentProgress }: QuickStatsProps) {
  console.log('📈 QuickStats rendering with progress:', studentProgress);

  const stats = [
    {
      title: 'Profile Strength',
      value: `${studentProgress?.profileStrength || 25}%`,
      description: 'Based on your progress',
      color: 'from-blue-500 to-blue-600',
      icon: '📊',
      progress: studentProgress?.profileStrength || 25,
    },
    {
      title: 'Documents Ready',
      value: `${studentProgress?.documents?.filter(d => d.status === 'completed').length || 0}/${studentProgress?.documents?.length || 4}`,
      description: 'Application documents',
      color: 'from-green-500 to-green-600',
      icon: '📄',
      progress: studentProgress?.documents ? 
        (studentProgress.documents.filter(d => d.status === 'completed').length / studentProgress.documents.length) * 100 : 0,
    },
    {
      title: 'Target Universities',
      value: studentProgress?.applications?.length || 0,
      description: 'Applications in progress',
      color: 'from-purple-500 to-purple-600',
      icon: '🏛️',
      progress: Math.min(((studentProgress?.applications?.length || 0) / 10) * 100, 100),
    },
    {
      title: 'Days to Deadline',
      value: '45',
      description: 'Next application deadline',
      color: 'from-orange-500 to-orange-600',
      icon: '⏰',
      progress: 65,
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 mb-6">
      <div className="grid grid-cols-4 gap-3">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="text-center p-3 hover:bg-gray-50 rounded-lg transition-colors group"
          >
            {/* Icon */}
            <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
              <span className="text-white text-lg">{stat.icon}</span>
            </div>
            
            {/* Value */}
            <div className="text-xl font-bold text-gray-900 mb-1">{stat.value}</div>
            
            {/* Title */}
            <div className="text-xs font-medium text-gray-700 mb-2">{stat.title}</div>
            
            {/* Progress */}
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div 
                className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                style={{ width: `${stat.progress}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}