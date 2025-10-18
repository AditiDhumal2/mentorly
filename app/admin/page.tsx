// app/admin/page.tsx
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from './components/AdminDashboard';

// This can remain a server component that handles auth
export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  // You can pass initial data as props if needed
  return <AdminDashboard />;
}