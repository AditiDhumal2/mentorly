import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userData = request.cookies.get('user-data')?.value;
  const { pathname, searchParams } = request.nextUrl;

  console.log(`🛡️ Middleware - Path: ${pathname}, Has Cookie: ${!!userData}`);

  // Create response object
  const response = NextResponse.next();

  // Add security headers to prevent caching of sensitive pages
  if (pathname.startsWith('/admin') || pathname === '/admin-login' || pathname.startsWith('/students')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
    response.headers.set('X-Content-Type-Options', 'nosniff');
  }

  // ALLOW LOGOUT PAGE FOR EVERYONE (NO AUTH CHECK)
  if (pathname === '/logout') {
    return response;
  }

  // ALLOW CLEAR-COOKIES PAGE FOR EVERYONE (NO AUTH CHECK)
  if (pathname === '/clear-cookies') {
    return response;
  }

  // PROTECT ADMIN ROUTES - BLOCK WITHOUT ADMIN AUTH
  if (pathname.startsWith('/admin')) {
    if (!userData) {
      console.log('🛑 Middleware BLOCKED: No auth cookie for admin route');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }

    // Validate cookie structure and admin role
    try {
      const parsed = JSON.parse(userData);
      if (!parsed.id || !parsed.email || !parsed.role) {
        console.log('🛑 Middleware BLOCKED: Invalid cookie structure for admin');
        const redirectResponse = NextResponse.redirect(new URL('/admin-login', request.url));
        redirectResponse.cookies.delete('user-data');
        return redirectResponse;
      }
      
      // Check if user is admin
      if (parsed.role !== 'admin') {
        console.log('🛑 Middleware BLOCKED: User is not admin');
        return NextResponse.redirect(new URL('/admin-login', request.url));
      }
    } catch {
      console.log('🛑 Middleware BLOCKED: Malformed cookie for admin');
      const redirectResponse = NextResponse.redirect(new URL('/admin-login', request.url));
      redirectResponse.cookies.delete('user-data');
      return redirectResponse;
    }
  }

  // PROTECT STUDENT ROUTES - BLOCK WITHOUT AUTH
  if (pathname.startsWith('/students')) {
    if (!userData) {
      console.log('🛑 Middleware BLOCKED: No auth cookie for student route');
      return NextResponse.redirect(new URL('/students-auth/login?error=unauthorized', request.url));
    }

    // Validate cookie structure
    try {
      const parsed = JSON.parse(userData);
      if (!parsed.id || !parsed.email || !parsed.role) {
        console.log('🛑 Middleware BLOCKED: Invalid cookie structure');
        const redirectResponse = NextResponse.redirect(new URL('/students-auth/login?error=invalid_cookie', request.url));
        redirectResponse.cookies.delete('user-data');
        return redirectResponse;
      }
    } catch {
      console.log('🛑 Middleware BLOCKED: Malformed cookie');
      const redirectResponse = NextResponse.redirect(new URL('/students-auth/login?error=malformed_cookie', request.url));
      redirectResponse.cookies.delete('user-data');
      return redirectResponse;
    }
  }

  // If user is authenticated and tries to access login pages, redirect appropriately
  if (userData) {
    try {
      const parsed = JSON.parse(userData);
      
      // If admin tries to access admin login, redirect to admin dashboard
      if (pathname === '/admin-login' && parsed.role === 'admin') {
        console.log('🔄 Middleware REDIRECT: Admin accessing login, redirecting to admin dashboard');
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      
      // If student tries to access student login, redirect to student dashboard
      if (pathname.startsWith('/students-auth/login') && parsed.role === 'student') {
        return NextResponse.redirect(new URL('/students-dashboard', request.url));
      }
    } catch {
      // If cookie is malformed, clear it and allow access to login page
      const errorResponse = NextResponse.next();
      errorResponse.cookies.delete('user-data');
      return errorResponse;
    }
  }

  // ALLOW LOGIN PAGES FOR EVERYONE (NO REDIRECTS)
  if (pathname.startsWith('/students-auth/login') || pathname === '/admin-login') {
    return response;
  }

  return response;
}

export const config = {
  matcher: [
    '/students/:path*',
    '/admin/:path*',
    '/students-auth/login',
    '/admin-login',
    '/logout',
    '/clear-cookies'
  ]
};