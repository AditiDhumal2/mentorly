import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import AdminDashboard from './components/AdminDashboard';

export default async function AdminDashboardPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'admin') {
    redirect('/admin-login?t=' + Date.now());
  }

  return <AdminDashboard />;
}