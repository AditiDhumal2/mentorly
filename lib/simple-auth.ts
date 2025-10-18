'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  year: number;
  college: string;
}

export async function requireStudentAuth(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user-data');
  
  console.log('🔐 AUTH - Checking student authentication');
  
  if (!userCookie?.value) {
    console.log('🛑 AUTH - No auth cookie, redirecting to login');
    redirect('/auth/login?error=unauthorized');
  }
  
  try {
    const userData = JSON.parse(userCookie.value);
    
    // Basic validation
    if (!userData.id || !userData.email) {
      console.log('🛑 AUTH - Invalid user data in cookie');
      cookieStore.delete('user-data');
      redirect('/auth/login?error=invalid_session');
    }
    
    console.log('✅ AUTH - Student authenticated:', userData.name);
    
    return {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'student',
      year: userData.year || 1,
      college: userData.college || '',
    };
  } catch (error) {
    console.error('❌ AUTH - Error:', error);
    cookieStore.delete('user-data');
    redirect('/auth/login?error=server_error');
  }
}