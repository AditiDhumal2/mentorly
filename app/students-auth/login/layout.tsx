import { requireGuest } from '@/actions/session-check';

export default async function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side check - redirects to /students if user is already logged in
  await requireGuest();
  
  return (
    <>
      {/* Additional client-side protection script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            // Client-side backup check
            (function() {
              try {
                // Check if user is logged in via cookies
                var cookieMatch = document.cookie.match(/user-data=([^;]+)/);
                
                if (cookieMatch && cookieMatch[1] && cookieMatch[1] !== '') {
                  console.log('🔐 LOGIN LAYOUT REDIRECT: User logged in, redirecting to /students');
                  
                  // Use replace to avoid adding to browser history
                  window.location.replace('/students');
                }
                
                // Also check localStorage/sessionStorage auth flags
                if (localStorage.getItem('user-authenticated') || sessionStorage.getItem('user-authenticated')) {
                  console.log('🔐 LOGIN LAYOUT STORAGE REDIRECT: Auth flags found, redirecting');
                  window.location.replace('/students');
                }
              } catch (error) {
                console.error('Login layout redirect error:', error);
              }
            })();
          `,
        }}
      />
      {children}
    </>
  );
}

export const dynamic = 'force-dynamic';