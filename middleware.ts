import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple session validation without database calls
function validateSession(cookieValue: string | undefined, expectedRole: string): boolean {
  if (!cookieValue) return false;

  try {
    const sessionData = JSON.parse(cookieValue);
    return sessionData.role === expectedRole;
  } catch (error) {
    return false;
  }
}

function detectUserRole(request: NextRequest): string {
  const studentSession = request.cookies.get('student-session-v2')?.value;
  const mentorSession = request.cookies.get('mentor-session')?.value;
  const adminData = request.cookies.get('admin-data')?.value;

  // STRICT ROLE DETECTION - No fallbacks between roles
  if (validateSession(adminData, 'admin')) return 'admin';
  if (validateSession(mentorSession, 'mentor')) return 'mentor';
  if (validateSession(studentSession, 'student')) return 'student';
  
  return 'guest';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // ✅ ALLOW API ROUTES - Skip middleware for all API routes
  if (pathname.startsWith('/api/')) {
    console.log('✅ API route accessed, allowing:', pathname);
    return NextResponse.next();
  }
  
  // ✅ ALLOW AUTH ACTIONS - Skip middleware for auth actions
  if (pathname.includes('/auth/') || pathname.includes('login') || pathname.includes('register')) {
    console.log('✅ Auth route accessed, allowing:', pathname);
    return NextResponse.next();
  }

  // ✅ ALLOW STATIC FILES
  if (pathname.match(/\.(css|js|png|jpg|jpeg|gif|webp|svg|ico)$/)) {
    return NextResponse.next();
  }

  // Get ALL cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log('🍪 ALL COOKIES:', allCookies.map(c => c.name));

  const studentSession = request.cookies.get('student-session-v2')?.value;
  const mentorSession = request.cookies.get('mentor-session')?.value;
  const adminData = request.cookies.get('admin-data')?.value;

  // Session validation
  const hasValidStudentSession = validateSession(studentSession, 'student');
  const hasValidMentorSession = validateSession(mentorSession, 'mentor');
  const hasValidAdminSession = validateSession(adminData, 'admin');

  const isAuthenticated = hasValidStudentSession || hasValidMentorSession || hasValidAdminSession;
  const userRole = detectUserRole(request);

  console.log('🛡️ MIDDLEWARE DEBUG:', {
    pathname,
    role: userRole,
    isAuthenticated,
    hasValidStudent: hasValidStudentSession,
    hasValidMentor: hasValidMentorSession,
    hasValidAdmin: hasValidAdminSession
  });

  // 🔓 ALLOW PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/welcome',
    '/students-auth/login',
    '/mentors-auth/login',
    '/admin-login',
    '/students-auth/register',
    '/mentors-auth/register',
  ];

  if (publicRoutes.includes(pathname)) {
    // ✅ ALLOW ACCESS TO LOGIN/REGISTER PAGES
    // Only redirect if user is trying to access login while already authenticated
    if (pathname === '/students-auth/login' && hasValidStudentSession && userRole === 'student') {
      console.log('✅ Student already logged in, redirecting to dashboard');
      return NextResponse.redirect(new URL('/students', request.url));
    }
    if (pathname === '/admin-login' && hasValidAdminSession && userRole === 'admin') {
      console.log('✅ Admin already logged in, redirecting to dashboard');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    console.log('✅ Public route, allowing:', pathname);
    return NextResponse.next();
  }

  // 🚫 PROTECT ADMIN ROUTES - CHECK FIRST
  if (pathname.startsWith('/admin')) {
    if (!hasValidAdminSession || userRole !== 'admin') {
      console.log('🚫 Admin route accessed without valid admin session');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
    return NextResponse.next();
  }

  // 🚫 PROTECT MENTOR ROUTES
  if (pathname.startsWith('/mentors/')) {
    if (!hasValidMentorSession || userRole !== 'mentor') {
      console.log('🚫 Mentor route accessed without valid mentor session');
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    }
    return NextResponse.next();
  }

  // 🚫 PROTECT STUDENT ROUTES
  if (pathname.startsWith('/students')) {
    if (!hasValidStudentSession || userRole !== 'student') {
      console.log('🚫 Student route accessed without valid student session');
      return NextResponse.redirect(new URL('/students-auth/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle root path
  if (pathname === '/') {
    if (isAuthenticated) {
      if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      if (userRole === 'mentor') return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
      if (userRole === 'student') return NextResponse.redirect(new URL('/students', request.url));
    }
    // For unauthenticated users, go to welcome page
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  // Default: allow access
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};