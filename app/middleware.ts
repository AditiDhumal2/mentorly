// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userData = request.cookies.get('user-data')?.value;
  const { pathname, searchParams } = request.nextUrl;

  console.log(`🛡️ Middleware - Path: ${pathname}, Has Cookie: ${!!userData}`);

  // ALLOW LOGOUT PAGE FOR EVERYONE (NO AUTH CHECK)
  if (pathname === '/logout') {
    return NextResponse.next();
  }

  // ALLOW CLEAR-COOKIES PAGE FOR EVERYONE (NO AUTH CHECK)
  if (pathname === '/clear-cookies') {
    return NextResponse.next();
  }

  // PROTECT STUDENT ROUTES - BLOCK WITHOUT AUTH
  if (pathname.startsWith('/students')) {
    if (!userData) {
      console.log('🛑 Middleware BLOCKED: No auth cookie for student route');
      return NextResponse.redirect(new URL('/auth/login?error=unauthorized', request.url));
    }

    // Validate cookie structure
    try {
      const parsed = JSON.parse(userData);
      if (!parsed.id || !parsed.email || !parsed.role) {
        console.log('🛑 Middleware BLOCKED: Invalid cookie structure');
        const response = NextResponse.redirect(new URL('/auth/login?error=invalid_cookie', request.url));
        response.cookies.delete('user-data');
        return response;
      }
    } catch {
      console.log('🛑 Middleware BLOCKED: Malformed cookie');
      const response = NextResponse.redirect(new URL('/auth/login?error=malformed_cookie', request.url));
      response.cookies.delete('user-data');
      return response;
    }
  }

  // ALLOW LOGIN PAGE FOR EVERYONE (REMOVED THE REDIRECT)
  // This is the key fix - don't redirect authenticated users from login page
  if (pathname.startsWith('/auth/login')) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/students/:path*',
    '/auth/login',
    '/logout',
    '/clear-cookies'
  ]
};