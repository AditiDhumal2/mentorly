'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    // Mock data for now - you can replace this with actual API call later
    const timer = setTimeout(() => {
      setStats({
        totalUsers: 150,
        totalRoadmaps: 25,
        totalDomains: 12,
        totalResources: 300,
        recentUsers: [
          {
            _id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            createdAt: new Date().toISOString()
          },
          {
            _id: '2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'student',
            createdAt: new Date().toISOString()
          },
          {
            _id: '3',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            role: 'mentor',
            createdAt: new Date().toISOString()
          }
        ]
      });
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
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
    <div className="space-y-6 p-6">
      {/* Dashboard Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage platform content and users</p>
          </div>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminSections.slice(0, 4).map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{section.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{section.count}</p>
              </div>
              <div className="text-2xl">{section.icon}</div>
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
          <div className="space-y-4">
            {stats?.recentUsers.map((user) => (
              <div key={user._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link 
            href="/admin/users" 
            className="bg-blue-50 hover:bg-blue-100 p-4 rounded-lg text-center transition-colors border border-blue-200"
          >
            <div className="text-blue-700 font-semibold">Add User</div>
            <div className="text-blue-600 text-sm mt-1">Create new user account</div>
          </Link>
          <Link 
            href="/admin/roadmaps" 
            className="bg-green-50 hover:bg-green-100 p-4 rounded-lg text-center transition-colors border border-green-200"
          >
            <div className="text-green-700 font-semibold">Create Roadmap</div>
            <div className="text-green-600 text-sm mt-1">Add new learning path</div>
          </Link>
          <Link 
            href="/admin/resources" 
            className="bg-orange-50 hover:bg-orange-100 p-4 rounded-lg text-center transition-colors border border-orange-200"
          >
            <div className="text-orange-700 font-semibold">Add Resource</div>
            <div className="text-orange-600 text-sm mt-1">Upload learning material</div>
          </Link>
          <Link 
            href="/admin/domains" 
            className="bg-purple-50 hover:bg-purple-100 p-4 rounded-lg text-center transition-colors border border-purple-200"
          >
            <div className="text-purple-700 font-semibold">New Domain</div>
            <div className="text-purple-600 text-sm mt-1">Add career domain</div>
          </Link>
        </div>
      </div>
    </div>
  );
}