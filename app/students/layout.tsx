import { requireStudentAuth } from '@/lib/simple-auth';
import DashboardLayout from './components/DashboardLayout';
import HistoryManager from './HistoryManager';

export default async function StudentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🎯 STUDENTS LAYOUT - Starting');
  
  const user = await requireStudentAuth();
  
  console.log('✅ STUDENTS LAYOUT - Access granted for:', user.name);

  return (
    <DashboardLayout user={user}>
      {/* REMOVED: <AuthGuard /> - server auth is sufficient */}
      <HistoryManager />
      {children}
    </DashboardLayout>
  );
}