import AdminLoginForm from './AdminLoginForm';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <AdminLoginForm />
        <div className="text-center">
          <p className="text-xs text-gray-500">Restricted access. Authorized personnel only.</p>
        </div>
      </div>
    </div>
  );
}