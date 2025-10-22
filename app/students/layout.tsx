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
    <>
      {/* Set client-side auth flags */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Set auth flags when user accesses student pages
            try {
              localStorage.setItem('user-authenticated', 'true');
              sessionStorage.setItem('user-authenticated', 'true');
              console.log('🔐 Auth flags set for client-side detection');
            } catch (error) {
              console.error('Error setting auth flags:', error);
            }
          `,
        }}
      />
      <DashboardLayout user={user}>
        <HistoryManager />
        {children}
      </DashboardLayout>
    </>
  );
}

export const dynamic = 'force-dynamic';