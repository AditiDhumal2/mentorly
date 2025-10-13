'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/actions/adminActions';

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
    <div className="p-6">
      {/* Admin Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Manage platform content and users
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {adminSections.slice(0, 4).map((section) => (
          <div key={section.title} className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className={`p-3 ${section.color.split(' ')[0]} rounded-lg`}>
                <span className="text-2xl">{section.icon}</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{section.title}</p>
                <p className="text-2xl font-bold text-gray-900">{section.count}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

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
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-3">
            {stats?.recentUsers && stats.recentUsers.length > 0 ? (
              stats.recentUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'admin' ? 'bg-red-100 text-red-800' :
                    user.role === 'mentor' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No users found</p>
            )}
          </div>
          <Link 
            href="/admin/users"
            className="block mt-4 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View all users →
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Add New Resource
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
            Update Market Trends
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
            Create Roadmap
          </button>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
            Add Career Domain
          </button>
        </div>
      </div>
    </div>
  );
}