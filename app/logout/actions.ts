'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function logout() {
  try {
    const cookieStore = await cookies();
    
    // Clear the user-data cookie
    cookieStore.delete('user-data');
    
    // Clear any other auth cookies you might have
    cookieStore.delete('session');
    cookieStore.delete('token');
    
    console.log('✅ LOGOUT ACTION - All cookies cleared successfully');
    
  } catch (error) {
    console.error('❌ LOGOUT ACTION - Error clearing cookies:', error);
  } finally {
    // Always redirect to login, even if there's an error
    console.log('🔄 LOGOUT ACTION - Redirecting to login');
    redirect('/auth/login?logout=success&server=1');
  }
}