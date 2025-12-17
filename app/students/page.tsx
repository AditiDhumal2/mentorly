import { getCurrentStudent } from '@/actions/userActions';
import { redirect } from 'next/navigation';

export default async function StudentsPage() {
  // Check if student is logged in
  const user = await getCurrentStudent();
  
  console.log('🎯 /students page - User:', user ? user.name : 'Not logged in');
  
  // If user is logged in, redirect to dashboard
  if (user && user.role === 'student') {
    console.log('✅ /students - Redirecting to dashboard');
    redirect('/students/dashboard');
  }
  
  // If no user, redirect to login
  console.log('❌ /students - No user, redirecting to login');
  redirect('/students-auth/login');
}