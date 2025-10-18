'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function logoutUser() {
  try {
    console.log('🚪 logoutUser - Starting server-side logout process');
    
    const cookieStore = await cookies();
    
    // NUCLEAR COOKIE CLEARING - Clear all potential auth cookies
    const authCookies = [
      'user-data',
      'session',
      'token', 
      'auth-token',
      'user',
      'auth',
      'session-id'
    ];
    
    // Method 1: Delete cookies using delete method
    authCookies.forEach(cookieName => {
      try {
        cookieStore.delete(cookieName);
        console.log(`✅ logoutUser - Deleted cookie: ${cookieName}`);
      } catch (error) {
        console.log(`⚠️ logoutUser - Could not delete cookie: ${cookieName}`);
      }
    });

    // Method 2: Set cookies with past expiration (backup method)
    authCookies.forEach(cookieName => {
      try {
        cookieStore.set(cookieName, '', {
          expires: new Date(0),
          path: '/',
          maxAge: 0
        });
        console.log(`✅ logoutUser - Expired cookie: ${cookieName}`);
      } catch (error) {
        console.log(`⚠️ logoutUser - Could not expire cookie: ${cookieName}`);
      }
    });

    console.log('✅ logoutUser - Nuclear cookie clearance completed');
    
    // Redirect to login with cache busting
    redirect('/auth/login?logout=true&t=' + Date.now() + '&cleared=true&server=true');
    
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('❌ logoutUser - Error during logout:', error);
    // Force redirect even on error
    redirect('/auth/login?logout=true&t=' + Date.now() + '&error=logout_failed');
  }
}