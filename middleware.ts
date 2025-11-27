// middleware.ts - SIMPLIFIED VERSION
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for current session cookies
  const userSession = request.cookies.get('user-session')?.value;
  const authSession = request.cookies.get('auth-session')?.value;
  
  const isAuthenticated = !!userSession || !!authSession;
  
  let userRole = 'guest';

  try {
    if (userSession) {
      const userData = JSON.parse(userSession);
      userRole = userData.role || 'student';
    } else if (authSession) {
      const userData = JSON.parse(authSession);
      userRole = userData.role || 'student';
    }
  } catch (error) {
    // Ignore parsing errors
  }

  console.log('🛡️ Middleware:', { pathname, authenticated: isAuthenticated, role: userRole });

  // Redirect authenticated users away from login
  if (isAuthenticated && (pathname === '/login' || pathname.includes('-auth/login'))) {
    if (userRole === 'student') return NextResponse.redirect(new URL('/students/dashboard', request.url));
    if (userRole === 'mentor') return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect routes - only check if user is authenticated, not specific roles for now
  if ((pathname.startsWith('/students/') || pathname.startsWith('/mentors/') || pathname.startsWith('/admin')) && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/students/:path*', 
    '/mentors/:path*',
    '/login',
    '/admin-login',
    '/students-auth/:path*',
    '/mentors-auth/:path*',
  ],
};
