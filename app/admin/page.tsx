// app/admin/page.tsx
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Students</h3>
          <p className="text-3xl font-bold text-purple-600">1,234</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Today</h3>
          <p className="text-3xl font-bold text-green-600">567</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">New Signups</h3>
          <p className="text-3xl font-bold text-blue-600">89</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <div className="text-purple-600 font-semibold">Manage Students</div>
            <div className="text-sm text-purple-500 mt-1">View and manage all students</div>
          </button>
          
          <button className="p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <div className="text-blue-600 font-semibold">View Analytics</div>
            <div className="text-sm text-blue-500 mt-1">System performance metrics</div>
          </button>
          
          <button className="p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
            <div className="text-green-600 font-semibold">Content Management</div>
            <div className="text-sm text-green-500 mt-1">Manage roadmaps and resources</div>
          </button>
          
          <button className="p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-left">
            <div className="text-orange-600 font-semibold">System Settings</div>
            <div className="text-sm text-orange-500 mt-1">Configure system options</div>
          </button>
        </div>
      </div>
    </div>
  );
}