// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple session validation without database calls (for Edge Runtime)
function validateSession(cookieValue: string | undefined, expectedRole: string): boolean {
  if (!cookieValue) return false;
  
  try {
    const sessionData = JSON.parse(cookieValue);
    
    // Basic validation checks
    if (sessionData.role !== expectedRole) return false;
    
    // Check for required fields based on role
    if (expectedRole === 'student' && !sessionData.id) return false;
    if (expectedRole === 'mentor' && !sessionData.mentorId) return false;
    if (expectedRole === 'admin' && !sessionData.adminId) return false;
    
    // Optional: Check if session is not expired
    if (sessionData.expires && new Date(sessionData.expires) < new Date()) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Skip middleware for static files and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/') || // Allow API routes
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }

  // Get session cookies
  const studentSession = request.cookies.get('student-session-v2')?.value;
  const mentorSession = request.cookies.get('mentor-session')?.value;
  const adminData = request.cookies.get('admin-data')?.value;

  // Validate sessions
  const hasValidStudentSession = validateSession(studentSession, 'student');
  const hasValidMentorSession = validateSession(mentorSession, 'mentor');
  const hasValidAdminSession = validateSession(adminData, 'admin');

  const isAuthenticated = hasValidStudentSession || hasValidMentorSession || hasValidAdminSession;

  // Determine user role
  let userRole = 'guest';
  if (hasValidStudentSession) userRole = 'student';
  else if (hasValidMentorSession) userRole = 'mentor';
  else if (hasValidAdminSession) userRole = 'admin';

  console.log('🛡️ MIDDLEWARE:', {
    path: pathname,
    authenticated: isAuthenticated,
    role: userRole,
    hasStudent: hasValidStudentSession,
    hasMentor: hasValidMentorSession
  });

  // 🔐 REDIRECT AUTHENTICATED USERS AWAY FROM LOGIN PAGES
  const isLoginPage = 
    pathname === '/login' || 
    pathname === '/students-auth/login' || 
    pathname === '/mentors-auth/login' ||
    pathname === '/admin-login';

  if (isLoginPage && isAuthenticated) {
    console.log('Redirecting authenticated user from login page');
    
    // Add cache-buster to prevent caching issues
    const timestamp = Date.now();
    
    if (userRole === 'student') {
      return NextResponse.redirect(new URL(`/students/dashboard?t=${timestamp}`, request.url));
    } else if (userRole === 'mentor') {
      return NextResponse.redirect(new URL(`/mentors/dashboard?t=${timestamp}`, request.url));
    } else if (userRole === 'admin') {
      return NextResponse.redirect(new URL(`/admin?t=${timestamp}`, request.url));
    }
  }

  // ✅ ALLOW PUBLIC ROUTES WITHOUT AUTH
  const publicRoutes = [
    '/',
    '/welcome',
    '/register',
    '/students-auth/register',
    '/mentors-auth/register',
    '/api/auth', // Allow auth API routes
    '/auth' // Allow auth pages
  ];

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route)) || 
                       pathname.includes('-auth/register');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // ✅ ALLOW LOGIN PAGES FOR UNAUTHENTICATED USERS
  if (isLoginPage && !isAuthenticated) {
    return NextResponse.next();
  }

  // 🚫 PROTECT STUDENT ROUTES
  if (pathname.startsWith('/students/')) {
    if (!isAuthenticated || !hasValidStudentSession) {
      console.log('Student route protection: Redirecting to student login');
      // Add redirect URL for after login
      const redirectUrl = `/students-auth/login?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // 🚫 PROTECT MENTOR ROUTES
  if (pathname.startsWith('/mentors/')) {
    if (!isAuthenticated || !hasValidMentorSession) {
      console.log('Mentor route protection: Redirecting to mentor login');
      // Add redirect URL for after login
      const redirectUrl = `/mentors-auth/login?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  // 🚫 PROTECT ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || !hasValidAdminSession) {
      console.log('Admin route protection: Redirecting to admin login');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // 🚫 PROTECT MAIN DASHBOARD - require any authenticated role
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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};