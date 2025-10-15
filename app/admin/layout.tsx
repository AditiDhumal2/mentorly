// app/admin/layout.tsx (Root admin layout)
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const user = await getCurrentUser();

  // For login page, we don't check auth
  // Let the individual route groups handle their own layouts
  
  return <>{children}</>;
}