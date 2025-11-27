// middleware.ts 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  let userRole = 'guest';


  if (isAuthenticated) {
    try {
      if (userSession) {
        const userData = JSON.parse(userSession);
        userRole = userData.role || userData.type || 'student';
      } else if (authSession) {
        const userData = JSON.parse(authSession);
        userRole = userData.role || userData.type || 'student';
      } else if (userSimple) {
        const userData = JSON.parse(userSimple);
        userRole = userData.role || userData.type || 'student';
      } else if (studentSession) {
        userRole = 'student';
      } else if (mentorSession) {
        userRole = 'mentor';
      } else if (adminData) {
        userRole = 'admin';
      }
      
      console.log('✅ User role determined:', userRole);
      
    } catch (error) {
      console.error('❌ Error parsing user session, but user is authenticated');
      // If we can't parse but cookies exist, treat as student by default
      userRole = 'student';
    }
  }

  console.log('🛡️ MIDDLEWARE:');
  console.log('  Path:', pathname);
  console.log('  Authenticated:', isAuthenticated);
  console.log('  Role:', userRole);

  // 🎯 CRITICAL: REDIRECT AUTHENTICATED USERS AWAY FROM LOGIN PAGES
  const isLoginPage = 
    pathname === '/login' || 
    pathname === '/students-auth/login' || 
    pathname === '/mentors-auth/login' ||
    pathname === '/admin-login';

  if (isLoginPage && isAuthenticated) {
    console.log('🚫 Authenticated user trying to access login - redirecting to dashboard');
    
    // Redirect based on ACTUAL role (not guest)
    if (userRole === 'student') {
      return NextResponse.redirect(new URL('/students/dashboard', request.url));
    } else if (userRole === 'mentor') {
      return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
    } else if (userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      // Fallback for any other role
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // 🎯 ALLOW LOGIN PAGES ONLY FOR UNAUTHENTICATED USERS
  if (isLoginPage) {
    console.log('✅ Allowing access to login page (user not authenticated)');
    return NextResponse.next();
  }

  // 🎯 ALLOW REGISTRATION PAGES
  if (pathname === '/register' || pathname.includes('-auth/register')) {
    console.log('✅ Allowing access to registration page');
    return NextResponse.next();
  }

  // 🎯 ALLOW PUBLIC PAGES
  if (pathname === '/' || pathname === '/welcome') {
    console.log('✅ Allowing access to public page');
    return NextResponse.next();
  }

  // 🚫 PROTECT DASHBOARD ROUTE
  if (pathname === '/dashboard') {
    if (!isAuthenticated) {
      console.log('🚫 No auth for dashboard, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('✅ User authenticated, allowing access to dashboard');
  }

  // 🚫 PROTECT STUDENT ROUTES
  if (pathname.startsWith('/students/')) {
    if (!isAuthenticated) {
      console.log('🚫 No auth for student route, redirecting to login');
      return NextResponse.redirect(new URL('/login?type=student', request.url));
    }
    if (userRole !== 'student') {
      console.log('🚫 Wrong role for student route, redirecting to login');
      return NextResponse.redirect(new URL('/login?type=student', request.url));
    }
    console.log('✅ Student authenticated, allowing access');
  }

  // 🚫 PROTECT MENTOR ROUTES
  if (pathname.startsWith('/mentors/')) {
    if (!isAuthenticated) {
      console.log('🚫 No auth for mentor route, redirecting to login');
      return NextResponse.redirect(new URL('/login?type=mentor', request.url));
    }
    if (userRole !== 'mentor') {
      console.log('🚫 Wrong role for mentor route, redirecting to login');
      return NextResponse.redirect(new URL('/login?type=mentor', request.url));
    }
    console.log('✅ Mentor authenticated, allowing access');
  }

  // 🚫 PROTECT ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      console.log('🚫 No auth for admin route, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== 'admin') {
      console.log('🚫 Wrong role for admin route, redirecting to login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    console.log('✅ Admin authenticated, allowing access');
  }

  // ✅ ALLOW ALL OTHER REQUESTS
  console.log('➡️ Allowing request to continue');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect these routes
    '/admin/:path*',
    '/students/:path*',
    '/mentors/:path*',
    '/dashboard',
    
    // Allow access to these (with authentication checks)
    '/login',
    '/register', 
    '/admin-login',
    '/students-auth/:path*',
    '/mentors-auth/:path*',
    '/welcome',
  ],
};