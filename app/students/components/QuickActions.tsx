'use client';

import { useRouter } from 'next/navigation';

interface QuickActionsProps {
  currentYear: number;
}

export default function QuickActions({ currentYear }: QuickActionsProps) {
  const router = useRouter();

  const quickActions = [
    {
      title: 'Continue Roadmap',
      description: `Resume Year ${currentYear} learning path`,
      icon: '🗺️',
      action: () => router.push('/roadmap'),
      gradient: 'from-blue-500 to-cyan-500',
      iconBg: 'bg-blue-500',
    },
    {
      title: 'Practice DSA',
      description: 'Solve coding problems',
      icon: '💻',
      action: () => router.push('/placement-hub'),
      gradient: 'from-green-500 to-emerald-500',
      iconBg: 'bg-green-500',
    },
    {
      title: 'Build Profile',
      description: 'Complete branding tasks',
      icon: '⭐',
      action: () => router.push('/branding'),
      gradient: 'from-purple-500 to-pink-500',
      iconBg: 'bg-purple-500',
    },
    {
      title: 'Explore Careers',
      description: 'Discover opportunities',
      icon: '🎯',
      action: () => router.push('/career-domains'),
      gradient: 'from-orange-500 to-red-500',
      iconBg: 'bg-orange-500',
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <span className="text-purple-500 mr-2">⚡</span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`group relative overflow-hidden bg-gradient-to-r ${action.gradient} rounded-xl p-4 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <div className="relative z-10 flex items-center space-x-4">
              <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-xl">{action.icon}</span>
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-white group-hover:text-white/90">{action.title}</p>
                <p className="text-sm opacity-90 group-hover:opacity-100">{action.description}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <span className="text-lg">→</span>
              </div>
            </div>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        ))}
      </div>
    </div>
  );
}