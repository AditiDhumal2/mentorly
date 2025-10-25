'use server';

import { cookies } from 'next/headers';

/**
 * Quick session check without DB call (uses cookies only)
 * NO REDIRECTS - just returns session status
 */
export async function checkSession() {
  try {
    const cookieStore = await cookies();
    const adminCookie = cookieStore.get('admin-data');
    const userCookie = cookieStore.get('user-data');
    
    // Check admin session first
    if (adminCookie?.value) {
      const adminData = JSON.parse(adminCookie.value);
      return { 
        isLoggedIn: true, 
        user: adminData,
        role: 'admin'
      };
    }
    
    // Check student session
    if (userCookie?.value) {
      const userData = JSON.parse(userCookie.value);
      return { 
        isLoggedIn: true, 
        user: userData,
        role: 'student'
      };
    }
    
    return { isLoggedIn: false, user: null, role: null };
  } catch (error) {
    console.error('❌ checkSession - Error:', error);
    return { isLoggedIn: false, user: null, role: null };
  }
}

/**
 * Check if user is guest - NO REDIRECTS
 */
export async function requireGuest() {
  console.log('🔐 requireGuest - Checking if user is guest...');
  
  const { isLoggedIn, role } = await checkSession();
  
  return { 
    isGuest: !isLoggedIn,
    role: role 
  };
}

/**
 * Check if user is student - NO REDIRECTS
 */
export async function requireStudent() {
  console.log('🔐 requireStudent - Checking if user is student...');
  
  const { isLoggedIn, role } = await checkSession();
  
  return { 
    isStudent: isLoggedIn && role === 'student',
    isLoggedIn,
    role
  };
}

/**
 * Check if user is admin - NO REDIRECTS
 */
export async function requireAdmin() {
  console.log('🔐 requireAdmin - Checking if user is admin...');
  
  const { isLoggedIn, role } = await checkSession();
  
  return { 
    isAdmin: isLoggedIn && role === 'admin',
    isLoggedIn,
    role
  };
}