import { cookies } from 'next/headers';

export async function clearStaleCookies() {
  const cookieStore = await cookies();
  cookieStore.delete('user-data');
  console.log('✅ Stale cookies cleared');
}

// Run this function
clearStaleCookies();