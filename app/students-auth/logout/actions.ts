'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export async function logout() {
  try {
    console.log('🚪 logout - Starting server-side logout process');
    
    const cookieStore = await cookies();
    
    // Log current cookies before deletion
    console.log('🔍 logout - Current cookies:', {
      hasUserData: !!cookieStore.get('user-data'),
      allCookies: cookieStore.getAll().map(c => c.name)
    });
    
    // Clear all potential auth cookies
    const authCookies = [
      'user-data',
      'session',
      'token', 
      'auth-token',
      'user',
      'auth',
      'session-id'
    ];
    
    // Delete all auth cookies with detailed logging
    authCookies.forEach(cookieName => {
      const hadCookie = !!cookieStore.get(cookieName);
      cookieStore.delete(cookieName);
      console.log(`🗑️ logout - Deleted ${cookieName}: ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
    });

    // Verify cookies are deleted
    const userDataAfter = cookieStore.get('user-data');
    console.log('✅ logout - Verification:', {
      userDataAfter: userDataAfter ? 'STILL_EXISTS' : 'DELETED',
      allCookiesAfter: cookieStore.getAll().map(c => c.name)
    });

    console.log('✅ logout - All cookies cleared successfully');
    
  } catch (error) {
    // Proper TypeScript error handling
    console.error('❌ logout - Error clearing cookies:');
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    } else {
      console.error('Unknown error type:', error);
    }
    
    // Don't throw the error, just redirect to login
    redirect('/students-auth/login?logout=error');
  }
  
  // Always redirect to login with success
  redirect('/students-auth/login?logout=success');
}