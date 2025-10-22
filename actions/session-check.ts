'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

/**
 * Quick session check without DB call (uses cookie only)
 * For layout-level redirects and guest checks
 */
export async function checkSession() {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user-data');
    
    if (!userCookie?.value) {
      return { isLoggedIn: false, user: null };
    }
    
    const userData = JSON.parse(userCookie.value);
    return { 
      isLoggedIn: true, 
      user: userData 
    };
  } catch (error) {
    console.error('❌ checkSession - Error:', error);
    return { isLoggedIn: false, user: null };
  }
}

/**
 * Require guest - redirect to students if already logged in
 * Uses quick cookie check for performance
 */
export async function requireGuest() {
  console.log('🔐 requireGuest - Checking if user is guest...');
  
  const { isLoggedIn, user } = await checkSession();
  
  if (isLoggedIn) {
    console.log('🔄 requireGuest - User already authenticated, redirecting to students');
    redirect('/students');
  }
  
  console.log('✅ requireGuest - User is guest, allowing access');
}