'use server';

import { cookies } from 'next/headers';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  year: number;
  college: string;
}

// NO REDIRECTS - just return authentication status
export async function requireStudentAuth(): Promise<{ authenticated: boolean; user?: AuthenticatedUser }> {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user-data');
  
  console.log('🔐 AUTH - Starting authentication check');
  console.log('🔐 AUTH - Cookie exists:', !!userCookie);
  
  if (!userCookie?.value) {
    console.log('🛑 AUTH - NO AUTH COOKIE');
    return { authenticated: false };
  }
  
  try {
    const userData = JSON.parse(userCookie.value);
    console.log('🔐 AUTH - Parsed user data:', {
      hasId: !!userData.id,
      hasEmail: !!userData.email,
      hasName: !!userData.name,
      role: userData.role
    });
    
    // Basic validation
    if (!userData.id || !userData.email) {
      console.log('🛑 AUTH - Invalid user data in cookie');
      cookieStore.delete('user-data');
      return { authenticated: false };
    }
    
    console.log('✅ AUTH - Student authenticated:', userData.name);
    
    return {
      authenticated: true,
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role || 'student',
        year: userData.year || 1,
        college: userData.college || '',
      }
    };
  } catch (error) {
    console.error('❌ AUTH - Error parsing cookie:', error);
    cookieStore.delete('user-data');
    return { authenticated: false };
  }
}