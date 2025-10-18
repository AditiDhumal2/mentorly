import { logout } from './actions';
import LogoutClient from './LogoutClient';

export default function LogoutPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p className="text-gray-600">Please wait while we securely log you out.</p>
        
        {/* Server-side logout form (auto-submits via client component) */}
        <form action={logout} id="logout-form" className="hidden">
          <button type="submit">Logout</button>
        </form>
        
        {/* Client-side cleanup and auto-submit */}
        <LogoutClient />
        
        {/* Manual fallback button */}
        <div className="mt-6">
          <button 
            onClick={() => {
              const form = document.getElementById('logout-form') as HTMLFormElement;
              form?.submit();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg"
          >
            Click here if not redirected
          </button>
        </div>
      </div>
    </div>
  );
}