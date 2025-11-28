// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.css') ||
    pathname.includes('.js')
  ) {
    return NextResponse.next();
  }

  // Check for ALL possible session cookies
  const userSession = request.cookies.get('user-session')?.value;
  const authSession = request.cookies.get('auth-session')?.value;
  const authToken = request.cookies.get('auth-token')?.value;
  const userSimple = request.cookies.get('user-simple')?.value;
  const studentSession = request.cookies.get('student-session-v2')?.value;
  const mentorSession = request.cookies.get('mentor-session')?.value;
  const adminData = request.cookies.get('admin-data')?.value;

  // User is authenticated if ANY of these cookies exist
  const isAuthenticated = !!userSession || !!authSession || !!authToken || 
                         !!userSimple || !!studentSession || !!mentorSession || !!adminData;

  // ✅ FIXED ROLE DETECTION LOGIC
  let userRole = 'guest';

  if (isAuthenticated) {
    try {
      // 🆕 Route-aware session detection - FIXED VERSION
      if (pathname.startsWith('/mentors') && mentorSession) {
        userRole = 'mentor';
      } 
      else if (pathname.startsWith('/students') && studentSession) {
        userRole = 'student';
      }
      // Route-agnostic fallback
      else if (mentorSession) {
        userRole = 'mentor';
      } else if (studentSession) {
        userRole = 'student';
      } else if (adminData) {
        userRole = 'admin';
      } else if (userSession) {
        try {
          const userData = JSON.parse(userSession);
          userRole = userData.role || userData.type || 'guest'; // ✅ Default to guest, not student
        } catch {
          userRole = 'guest'; // ✅ Default to guest on error
        }
      } else {
        userRole = 'guest'; // ✅ Default to guest instead of student
      }
    } catch (error) {
      console.error('Error parsing user session:', error);
      userRole = 'guest'; // ✅ Default to guest on error
    }
  }

  console.log('🛡️ MIDDLEWARE:', {
    path: pathname,
    authenticated: isAuthenticated,
    role: userRole
  });

  // 🔐 REDIRECT AUTHENTICATED USERS AWAY FROM LOGIN PAGES
  const isLoginPage = 
    pathname === '/login' || 
    pathname === '/students-auth/login' || 
    pathname === '/mentors-auth/login' ||
    pathname === '/admin-login';

  if (isLoginPage && isAuthenticated) {
    console.log('Redirecting authenticated user from login page');
    
    // ✅ FIXED: Use the correctly detected role
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/students/dashboard', request.url));
    } else if (userRole === 'mentor') {
      return NextResponse.redirect(new URL('/mentors/dashboard', request.url)); // ✅ Now correct
    } else if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ✅ ALLOW PUBLIC ROUTES WITHOUT AUTH
  const publicRoutes = [
    '/',
    '/welcome',
    '/register',
    '/students-auth/register',
    '/mentors-auth/register'
  ];

  if (publicRoutes.includes(pathname) || pathname.includes('-auth/register')) {
    return NextResponse.next();
  }

  // ✅ ALLOW LOGIN PAGES FOR UNAUTHENTICATED USERS
  if (isLoginPage && !isAuthenticated) {
    return NextResponse.next();
  }

  // 🚫 PROTECT STUDENT ROUTES
  if (pathname.startsWith('/students/')) {
    if (!isAuthenticated) {
      console.log('Redirecting to student login');
      return NextResponse.redirect(new URL('/students-auth/login', request.url));
    }
    if (userRole !== 'student') {
      console.log('Wrong role for student route');
      return NextResponse.redirect(new URL('/students-auth/login', request.url));
    }
  }

  // 🚫 PROTECT MENTOR ROUTES
  if (pathname.startsWith('/mentors/')) {
    if (!isAuthenticated) {
      console.log('Redirecting to mentor login');
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    }
    if (userRole !== 'mentor') {
      console.log('Wrong role for mentor route');
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    }
  }

  // 🚫 PROTECT ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      console.log('Redirecting to admin login');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    if (userRole !== 'admin') {
      console.log('Wrong role for admin route');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // 🚫 PROTECT MAIN DASHBOARD
  if (pathname === '/dashboard' && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // ✅ ALLOW ALL OTHER REQUESTS
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};