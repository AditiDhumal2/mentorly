// app/students-auth/logout/actions.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  try {
    const cookieStore = await cookies();
    
    // Clear ALL student authentication cookies
    const studentCookies = [
      'student-data', 
      'user-data', 
      'student-session-v2',
      'auth-token'
    ];
    
    // 🆕 FIX: Properly clear cookies by setting expired dates
    studentCookies.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });

    console.log('✅ ALL student cookies cleared successfully');
    
    // 🆕 CRITICAL: Use redirect() instead of returning URL
    redirect('/students-auth/login?logout=success');
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    // 🆕 FIX: Redirect even on error
    redirect('/students-auth/login?logout=error');
  }
}