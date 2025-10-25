import AdminMenu from './components/AdminMenu';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Remove requireAdminAuth() call - middleware handles authentication
  // const admin = await requireAdminAuth(); // REMOVE THIS LINE

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="flex">
        {/* Admin Menu Sidebar */}
        <AdminMenu />
        
        {/* Main Content Area */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}