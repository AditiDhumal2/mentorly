import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mentorly - Student Mentorship Platform',
  description: 'Student mentorship and guidance platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* SUPER AGGRESSIVE redirect for logged-in users on login page */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Run immediately when HTML is parsed
              (function() {
                // Check if we're on login page
                var isLoginPage = window.location.pathname === '/students-auth/login';
                
                if (isLoginPage) {
                  try {
                    // Quick and robust cookie check
                    var cookieMatch = document.cookie.match(/user-data=([^;]+)/);
                    
                    if (cookieMatch && cookieMatch[1] && cookieMatch[1] !== '') {
                      console.log('⚡ ROOT LAYOUT REDIRECT: User logged in, redirecting to /students');
                      
                      // Stop any ongoing page load
                      if (document.readyState === 'loading') {
                        window.stop();
                      }
                      
                      // Immediate redirect - don't wait for anything
                      window.location.replace('/students');
                    }
                  } catch (error) {
                    console.error('Root layout redirect error:', error);
                  }
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}