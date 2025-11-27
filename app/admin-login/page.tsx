// app/admin-login/page.tsx
import { Suspense } from 'react';
import AdminLoginContent from './AdminLoginContent';

export const dynamic = 'force-dynamic';

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin login...</p>
        </div>
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  );
}