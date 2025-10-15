// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userData = request.cookies.get('user-data')?.value;
  const { pathname } = request.nextUrl;

  // Parse user data if exists
  let userRole = null;
  let userEmail = null;
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      userRole = user.role;
      userEmail = user.email;
    } catch (error) {
      // Invalid user data
      console.log('🛑 Middleware - Invalid user data in cookie');
    }
  }

  console.log(`🛡️ Middleware - Path: ${pathname}, Role: ${userRole}, Email: ${userEmail}`);

  // Protect admin routes - only admins can access
  if (pathname.startsWith('/admin')) {
    if (!userData || userRole !== 'admin') {
      console.log('🛑 Middleware - Blocking admin route access for non-admin user');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Protect user dashboard routes - require authentication
  if (pathname.startsWith('/dashboard') && !userData) {
    console.log('🛑 Middleware - Blocking dashboard access for unauthenticated user');
    return NextResponse.redirect(new URL('/auth/login', request.url)); // FIXED: Changed from '/login' to '/auth/login'
  }

  // Redirect authenticated users away from login
  if (pathname === '/auth/login' && userData) { // FIXED: Added '/auth/' prefix
    console.log('🔄 Middleware - Redirecting authenticated user from login');
    if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/auth/login' // FIXED: Added '/auth/' prefix
  ]
};