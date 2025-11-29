// middleware.ts
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

  // 🆕 STRICT ROLE DETECTION - No fallbacks between roles
  if (validateSession(mentorSession, 'mentor')) return 'mentor';
  if (validateSession(studentSession, 'student')) return 'student';
  if (validateSession(adminData, 'admin')) return 'admin';
  
  return 'guest';
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Skip middleware for static files
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.ico') ||
    pathname.includes('.png') ||
    pathname.includes('.jpg') ||
    pathname.includes('.css') ||
    pathname.includes('.js') ||
    pathname.includes('.svg')
  ) {
    return NextResponse.next();
  }

  // 🆕 Get ALL cookies for debugging
  const allCookies = request.cookies.getAll();
  console.log('🍪 ALL COOKIES:', allCookies.map(c => c.name));

  const studentSession = request.cookies.get('student-session-v2')?.value;
  const mentorSession = request.cookies.get('mentor-session')?.value;
  const adminData = request.cookies.get('admin-data')?.value;

  // 🆕 STRICT Session validation
  const hasValidStudentSession = validateSession(studentSession, 'student');
  const hasValidMentorSession = validateSession(mentorSession, 'mentor');
  const hasValidAdminSession = validateSession(adminData, 'admin');

  const isAuthenticated = hasValidStudentSession || hasValidMentorSession || hasValidAdminSession;

  // 🆕 USE STRICT ROLE DETECTION
  const userRole = detectUserRole(request);

  console.log('🛡️ MIDDLEWARE DEBUG:', {
    path: pathname,
    authenticated: isAuthenticated,
    role: userRole,
    hasStudentCookie: !!studentSession,
    hasMentorCookie: !!mentorSession,
    hasValidStudent: hasValidStudentSession,
    hasValidMentor: hasValidMentorSession
  });

  // 🔐 REDIRECT AUTHENTICATED USERS AWAY FROM LOGIN PAGES
  const isStudentLoginPage = pathname === '/students-auth/login';
  const isMentorLoginPage = pathname === '/mentors-auth/login';
  const isAdminLoginPage = pathname === '/admin-login';
  const isGenericLoginPage = pathname === '/login';

  // 🆕 FIX: Only redirect if user has a VALID session for that specific role
  if (isStudentLoginPage && hasValidStudentSession && userRole === 'student') {
    console.log('Redirecting student from student login to student dashboard');
    return NextResponse.redirect(new URL('/students', request.url));
  }

  if (isMentorLoginPage && hasValidMentorSession && userRole === 'mentor') {
    console.log('Redirecting mentor from mentor login to mentor dashboard');
    return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
  }

  if (isAdminLoginPage && hasValidAdminSession && userRole === 'admin') {
    console.log('Redirecting admin from admin login to admin dashboard');
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  if (isGenericLoginPage && isAuthenticated) {
    console.log('Redirecting authenticated user from generic login');
    // 🆕 Go to appropriate dashboard based on actual role
    if (userRole === 'student') return NextResponse.redirect(new URL('/students', request.url));
    if (userRole === 'mentor') return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
    if (userRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
  }

  // ✅ ALLOW PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/welcome',
    '/register',
    '/students-auth/register',
    '/mentors-auth/register',
    '/students-auth/login',
    '/mentors-auth/login',
    '/admin-login',
    '/login',
    '/api/auth'
  ];

  const isPublicRoute = publicRoutes.includes(pathname) || 
                       pathname.includes('-auth/register') ||
                       pathname.includes('-auth/login');

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // 🚫 PROTECT STUDENT ROUTES - ONLY STUDENTS ALLOWED
  // 🆕 FIX: Added protection for '/students' (without trailing slash)
  if (pathname.startsWith('/students/') || pathname === '/students') {
    if (!hasValidStudentSession) {
      console.log('🚫 Student route accessed without valid student session');
      
      // 🆕 CLEAR conflicting mentor session if exists
      if (hasValidMentorSession) {
        console.log('🧹 Clearing mentor session for student route access');
        const response = NextResponse.redirect(new URL('/students-auth/login', request.url));
        response.cookies.delete('mentor-session');
        return response;
      }
      
      return NextResponse.redirect(new URL('/students-auth/login', request.url));
    }
    
    // 🆕 Ensure only students can access student routes
    if (userRole !== 'student') {
      console.log('🚫 Non-student trying to access student route');
      const response = NextResponse.redirect(new URL('/students-auth/login', request.url));
      // Clear any conflicting sessions
      if (hasValidMentorSession) response.cookies.delete('mentor-session');
      if (hasValidAdminSession) response.cookies.delete('admin-data');
      return response;
    }
  }

  // 🚫 PROTECT MENTOR ROUTES - ONLY MENTORS ALLOWED
  // 🆕 FIX: Added protection for '/mentors/dashboard' explicitly
  if (pathname.startsWith('/mentors/') || pathname === '/mentors/dashboard') {
    if (!hasValidMentorSession) {
      console.log('🚫 Mentor route accessed without valid mentor session');
      
      // 🆕 CLEAR conflicting student session if exists
      if (hasValidStudentSession) {
        console.log('🧹 Clearing student session for mentor route access');
        const response = NextResponse.redirect(new URL('/mentors-auth/login', request.url));
        response.cookies.delete('student-session-v2');
        return response;
      }
      
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    }
    
    // 🆕 Ensure only mentors can access mentor routes
    if (userRole !== 'mentor') {
      console.log('🚫 Non-mentor trying to access mentor route');
      const response = NextResponse.redirect(new URL('/mentors-auth/login', request.url));
      // Clear any conflicting sessions
      if (hasValidStudentSession) response.cookies.delete('student-session-v2');
      if (hasValidAdminSession) response.cookies.delete('admin-data');
      return response;
    }
  }

  // 🚫 PROTECT ADMIN ROUTES
  if (pathname.startsWith('/admin')) {
    if (!hasValidAdminSession || userRole !== 'admin') {
      console.log('🚫 Admin route accessed without valid admin session');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    }
  }

  // 🆕 FIX: Handle root path redirects
  if (pathname === '/') {
    if (hasValidStudentSession && userRole === 'student') {
      return NextResponse.redirect(new URL('/students', request.url));
    }
    if (hasValidMentorSession && userRole === 'mentor') {
      return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
    }
    if (hasValidAdminSession && userRole === 'admin') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    // For unauthenticated users, keep them on welcome page or redirect to welcome
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
};