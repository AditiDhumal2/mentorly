// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminData = request.cookies.get('admin-data')?.value;
  
  // USE ONLY NEW COOKIE NAME - ignore all old cookies
  const studentDataCookie = request.cookies.get('student-session-v2')?.value;
  const isStudentAuthenticated = !!studentDataCookie && studentDataCookie.length > 10;

  const isAdminAuthenticated = !!adminData;

  console.log('🔍 MIDDLEWARE DEBUG (NEW COOKIE):');
  console.log('  Path:', pathname);
  console.log('  Student Auth:', isStudentAuthenticated);
  console.log('  Admin Auth:', isAdminAuthenticated);
  console.log('  Cookies:', {
    'student-session-v2': !!studentDataCookie,
    'student-data': !!request.cookies.get('student-data')?.value,
    'user-data': !!request.cookies.get('user-data')?.value,
    'admin-data': !!adminData,
    'student-session-v2-value': studentDataCookie?.substring(0, 20) + '...' || 'empty',
  });

  // 🔄 Redirect authenticated students AWAY from login pages
  if (isStudentAuthenticated && pathname === '/students-auth/login') {
    console.log('🔄 Student authenticated, redirecting FROM login TO dashboard');
    return NextResponse.redirect(new URL('/students', request.url));
  }

  // 🚫 Protect student routes - redirect UNAUTHENTICATED users to login
  if (pathname.startsWith('/students') && pathname !== '/students-auth/login') {
    if (!isStudentAuthenticated) {
      console.log('🚫 No student auth, redirecting TO login');
      return NextResponse.redirect(new URL('/students-auth/login', request.url));
    } else {
      console.log('✅ Student authenticated, allowing access to', pathname);
    }
  }

  // 🔄 Redirect authenticated admin AWAY from login
  if (isAdminAuthenticated && pathname === '/admin-login') {
    console.log('🔄 Admin authenticated, redirecting FROM admin-login TO admin');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // 🚫 Protect admin routes - redirect UNAUTHENTICATED users to admin login
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    if (!isAdminAuthenticated) {
      console.log('🚫 No admin auth, redirecting TO admin-login');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    } else {
      console.log('✅ Admin authenticated, allowing access to', pathname);
    }
  }

  console.log('➡️ Allowing request to continue');
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/students/:path*',
    '/admin-login',
    '/students-auth/login',
  ],
};