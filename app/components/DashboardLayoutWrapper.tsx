// app/components/DashboardLayoutWrapper.tsx
'use client';

import { usePathname } from 'next/navigation';
import DashboardLayout from '@/app/dashboard/components/DashboardLayout';

interface UserData {
  id: string;
  name: string;
  email: string;
  year: number;
  college: string;
  role: string;
  preferredLanguage?: string;
  profiles?: any;
  interests?: string[];
  roadmapProgress?: any[];
  learningStats?: any;
}

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  userData: UserData | null;
}

export default function DashboardLayoutWrapper({
  children,
  userData
}: DashboardLayoutWrapperProps) {
  const pathname = usePathname();

  console.log('=== DASHBOARD LAYOUT WRAPPER DEBUG ===');
  console.log('🔍 Current path:', pathname);
  console.log('🔍 User data:', userData);
  console.log('🔍 User role:', userData?.role);
  console.log('🔍 Children type:', typeof children);

  // Routes that should NEVER use any layout wrapper
  const noLayoutRoutes = [
    '/',
    '/welcome',
    '/auth/login',
    '/auth/register', 
    '/auth/clear',
    '/admin/login'
  ];

  // Check if current route should have NO layout
  const shouldHaveNoLayout = noLayoutRoutes.includes(pathname);

  // Check if current route is an admin dashboard route
  const isAdminDashboardRoute = pathname?.startsWith('/admin') && pathname !== '/admin/login';

  console.log('🔍 Should have no layout:', shouldHaveNoLayout);
  console.log('🔍 Is admin dashboard route:', isAdminDashboardRoute);

  // If it's a no-layout route OR admin dashboard route, return children directly
  if (shouldHaveNoLayout || isAdminDashboardRoute) {
    console.log('🔍 Returning children directly (no layout route)');
    return <>{children}</>;
  }

  // If no user data but it's a protected route, return children directly
  if (!userData) {
    console.log('🔍 No user data, returning children directly');
    return <>{children}</>;
  }

  console.log('🔍 Applying DashboardLayout to route:', pathname);
  
  return (
    <DashboardLayout user={{
      name: userData.name,
      email: userData.email,
      year: userData.year,
      college: userData.college,
      role: userData.role as 'student' | 'mentor'
    }}>
      {children}
    </DashboardLayout>
  );
}