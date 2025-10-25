// app/students-auth/logout/actions.ts
'use server';

import { cookies } from 'next/headers';

export async function logout() {
  try {
    const cookieStore = await cookies();
    
    // Clear ALL student authentication cookies
    const pastDate = new Date(0);
    const studentCookies = ['student-data', 'user-data', 'student-session-v2'];
    
    studentCookies.forEach(cookieName => {
      cookieStore.set(cookieName, '', { 
        expires: pastDate,
        path: '/',
      });
    });

    console.log('✅ ALL student cookies cleared including new student-session-v2');
    
    return {
      success: true,
      redirectUrl: '/students-auth/login?logout=success'
    };
  } catch (error) {
    console.error('❌ Logout error:', error);
    return {
      success: false,
      error: 'Failed to logout',
      redirectUrl: '/students-auth/login?logout=error'
    };
  }
}