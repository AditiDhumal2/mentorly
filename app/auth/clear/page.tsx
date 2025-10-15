// app/auth/clear/page.tsx
import { clearAuthCookies } from '@/actions/authActions';
import { redirect } from 'next/navigation';

export default async function ClearAuthPage() {
  await clearAuthCookies();
  redirect('/auth/login');
}