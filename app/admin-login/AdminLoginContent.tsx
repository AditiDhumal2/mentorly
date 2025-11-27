// app/admin-login/AdminLoginContent.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import AdminLoginForm from './AdminLoginForm';

export default function AdminLoginContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/admin';
  const error = searchParams.get('error');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <AdminLoginForm callbackUrl={callbackUrl} error={error} />
      </div>
    </div>
  );
}