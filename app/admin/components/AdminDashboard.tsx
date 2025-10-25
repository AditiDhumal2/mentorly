'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, canAccessAdmin } from '@/actions/adminAuthActions';

interface AdminPermissions {
  canManageUsers?: boolean;
  canManageContent?: boolean;
  canManageSystem?: boolean;
  canViewAnalytics?: boolean;
  read?: boolean;
  write?: boolean;
  delete?: boolean;
  create?: boolean;
}

interface AdminData {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions: string[] | AdminPermissions;
}

interface AdminDashboardProps {
  admin?: AdminData | null;
}

export default function AdminDashboard({ admin: initialAdmin }: AdminDashboardProps) {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminData | null>(initialAdmin || null);
  const [isLoading, setIsLoading] = useState(!initialAdmin);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    // If no admin prop was passed, check session client-side
    if (!initialAdmin) {
      const checkAdminAccess = async () => {
        try {
          const { canAccess, admin: adminData } = await canAccessAdmin();
          
          if (!canAccess || !adminData) {
            console.log('🛑 No admin access, redirecting to login');
            router.push('/admin-login');
            return;
          }
          
          setAdmin(adminData);
        } catch (error) {
          console.error('❌ Error checking admin access:', error);
          router.push('/admin-login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAdminAccess();
    } else {
      setIsLoading(false);
    }
  }, [initialAdmin, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await adminLogout();
      
      if (result.success) {
        // Clear client-side storage
        if (typeof window !== 'undefined') {
          localStorage.clear();
          sessionStorage.clear();
          
          // Clear cookies client-side as backup
          document.cookie = 'admin-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user-data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }
        
        // Use the redirect URL from server or fallback
        const redirectUrl = result.redirectUrl || '/admin-login?logout=success';
        window.location.href = redirectUrl;
      }
    } catch (error) {
      console.error('❌ Logout error:', error);
      // Fallback redirect
      window.location.href = '/admin-login?logout=success&fallback=true';
    }
  };

  // Helper function to format permissions for display
  const formatPermissions = (permissions: string[] | AdminPermissions | undefined): string => {
    if (!permissions) return 'No permissions';
    
    if (Array.isArray(permissions)) {
      return permissions.join(', ');
    }
    
    // Handle object format permissions
    if (typeof permissions === 'object') {
      const activePermissions = Object.entries(permissions)
        .filter(([_, value]) => value === true)
        .map(([key]) => {
          // Convert camelCase to readable format
          return key
            .replace('can', '')
            .replace(/([A-Z])/g, ' $1')
            .trim()
            .toLowerCase()
            .replace(/\b\w/g, l => l.toUpperCase());
        });
      
      return activePermissions.length > 0 ? activePermissions.join(', ') : 'No permissions';
    }
    
    return 'No permissions';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 mb-4">Access Denied</p>
          <button
            onClick={() => router.push('/admin-login')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-sm text-gray-500">{admin.email}</p>
              </div>
              
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Welcome, {admin.name}!
              </h2>
              <p className="text-gray-600">
                You are logged in as an administrator with {formatPermissions(admin.permissions)} permissions.
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">1,234</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Active Sessions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">567</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">Pending Actions</dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">23</dd>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
                <dd className="mt-1 text-3xl font-semibold text-green-600">98%</dd>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <button 
                  onClick={() => router.push('/admin/users')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">Manage Users</h4>
                  <p className="text-sm text-gray-500 mt-1">View and manage user accounts</p>
                </button>

                <button 
                  onClick={() => router.push('/admin/settings')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">System Settings</h4>
                  <p className="text-sm text-gray-500 mt-1">Configure system preferences</p>
                </button>

                <button 
                  onClick={() => router.push('/admin/reports')}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <h4 className="font-medium text-gray-900">View Reports</h4>
                  <p className="text-sm text-gray-500 mt-1">Access system analytics</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}