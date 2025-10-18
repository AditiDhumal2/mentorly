// app/admin/components/AdminDashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/actions/adminActions';
import DashboardHeader from './DashboardHeader';
import StatsGrid from './StatsGrid';
import RecentActivity from './RecentActivity';
import QuickActions from './QuickActions'; // Add this import

interface DashboardStats {
  totalUsers: number;
  totalRoadmaps: number;
  totalDomains: number;
  totalResources: number;
  recentUsers: Array<{
    _id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching admin stats:', error);
        // Set default stats if fetch fails
        setStats({
          totalUsers: 0,
          totalRoadmaps: 0,
          totalDomains: 0,
          totalResources: 0,
          recentUsers: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const adminSections = [
    {
      title: 'Roadmaps',
      description: 'Manage year-wise learning paths',
      href: '/admin/roadmaps',
      count: stats?.totalRoadmaps || 0,
      icon: '🗺️',
      color: 'bg-green-100 text-green-800'
    },
    {
      title: 'Career Domains',
      description: 'Add/edit career paths and information',
      href: '/admin/domains',
      count: stats?.totalDomains || 0,
      icon: '💼',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      title: 'Market Trends',
      description: 'Update trending skills and salary data',
      href: '/admin/trends',
      count: 'Monthly',
      icon: '📈',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      title: 'Resources',
      description: 'Manage learning materials and portals',
      href: '/admin/resources',
      count: stats?.totalResources || 0,
      icon: '📚',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      title: 'Users',
      description: 'View and manage all users',
      href: '/admin/users',
      count: stats?.totalUsers || 0,
      icon: '👥',
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      title: 'Community',
      description: 'Moderate forum posts and discussions',
      href: '/admin/community',
      count: 'Moderate',
      icon: '💬',
      color: 'bg-pink-100 text-pink-800'
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader 
        title="Admin Dashboard"
        description="Manage platform content and users"
        showLastUpdated={true}
      />
      
      {/* Stats Overview */}
      <StatsGrid stats={adminSections.slice(0, 4)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Admin Sections Grid */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminSections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{section.icon}</span>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {section.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                      {section.description}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${section.color}`}>
                    {section.count}
                  </span>
                </div>
                <div className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors">
                  Manage →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Users Sidebar */}
        <RecentActivity users={stats?.recentUsers || []} />
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  );
}