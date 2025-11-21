import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const adminData = request.cookies.get('admin-data')?.value;
  const studentDataCookie = request.cookies.get('student-session-v2')?.value;
  const mentorSession = request.cookies.get('mentor-session')?.value;

  const isStudentAuthenticated = !!studentDataCookie && studentDataCookie.length > 10;
  const isAdminAuthenticated = !!adminData;
  const isMentorAuthenticated = !!mentorSession && mentorSession.length > 10;

  console.log('🔍 MIDDLEWARE DEBUG:');
  console.log('  Path:', pathname);
  console.log('  Student Auth:', isStudentAuthenticated);
  console.log('  Admin Auth:', isAdminAuthenticated);
  console.log('  Mentor Auth:', isMentorAuthenticated);

  // 🆕 CRITICAL FIX: Clear conflicting sessions FIRST
  const response = NextResponse.next();
  
  if (pathname.startsWith('/students') && isMentorAuthenticated) {
    console.log('🚫 SECURITY: Mentor trying to access student route - CLEARING MENTOR SESSION');
    
    // Clear mentor session and redirect to student route
    response.cookies.delete('mentor-session');
    response.cookies.delete('mentor-data');
    
    // If student is also authenticated, allow access to student route
    if (isStudentAuthenticated) {
      console.log('✅ Student authenticated, allowing access after clearing mentor session');
      return response;
    } else {
      console.log('🔄 Redirecting to student login');
      return NextResponse.redirect(new URL('/students-auth/login', request.url));
    }
  }

  if (pathname.startsWith('/mentors') && isStudentAuthenticated) {
    console.log('🚫 SECURITY: Student trying to access mentor route - CLEARING STUDENT SESSION');
    
    // Clear student session and redirect to mentor route
    response.cookies.delete('student-session-v2');
    response.cookies.delete('student-data');
    response.cookies.delete('user-data');
    
    // If mentor is also authenticated, allow access to mentor route
    if (isMentorAuthenticated) {
      console.log('✅ Mentor authenticated, allowing access after clearing student session');
      return response;
    } else {
      console.log('🔄 Redirecting to mentor login');
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    }
  }

  // 🔄 Redirect authenticated students AWAY from login pages
  if (isStudentAuthenticated && pathname === '/students-auth/login') {
    console.log('🔄 Student authenticated, redirecting FROM login TO dashboard');
    return NextResponse.redirect(new URL('/students', request.url));
  }

  // 🔄 Redirect authenticated mentor AWAY from login pages
  if (isMentorAuthenticated && pathname === '/mentors-auth/login') {
    console.log('🔄 Mentor authenticated, redirecting FROM login TO appropriate page');
    
    try {
      const sessionData = JSON.parse(mentorSession);
      
      if (!sessionData.profileCompleted) {
        return NextResponse.redirect(new URL('/mentors/complete-profile', request.url));
      } else if (sessionData.approvalStatus !== 'approved') {
        return NextResponse.redirect(new URL('/mentors/pending-approval', request.url));
      } else {
        return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
      }
    } catch (error) {
      console.error('Error parsing mentor session:', error);
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    }
  }

  // 🔄 Redirect authenticated admin AWAY from login
  if (isAdminAuthenticated && pathname === '/admin-login') {
    console.log('🔄 Admin authenticated, redirecting FROM admin-login TO admin');
    return NextResponse.redirect(new URL('/admin', request.url));
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

  // 🚫 Protect admin routes - redirect UNAUTHENTICATED users to admin login
  if (pathname.startsWith('/admin') && pathname !== '/admin-login') {
    if (!isAdminAuthenticated) {
      console.log('🚫 No admin auth, redirecting TO admin-login');
      return NextResponse.redirect(new URL('/admin-login', request.url));
    } else {
      console.log('✅ Admin authenticated, allowing access to', pathname);
    }
  }

  // Protect mentor routes - redirect UNAUTHENTICATED users to mentor login
  if (pathname.startsWith('/mentors') && pathname !== '/mentors-auth/login') {
    if (!isMentorAuthenticated) {
      console.log('🚫 No mentor auth, redirecting TO mentor login');
      return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
    } else {
      console.log('✅ Mentor authenticated, allowing access to', pathname);
      
      try {
        const sessionData = JSON.parse(mentorSession);
        
        console.log('🔍 SESSION STATUS:', { 
          profileCompleted: sessionData.profileCompleted, 
          approvalStatus: sessionData.approvalStatus,
          pathname 
        });

        // Allow access to complete-profile only if profile is not completed
        if (pathname === '/mentors/complete-profile') {
          if (sessionData.profileCompleted) {
            console.log('📝 Profile already completed, redirecting to pending approval');
            return NextResponse.redirect(new URL('/mentors/pending-approval', request.url));
          }
          console.log('✅ Allowing access to complete-profile');
          return NextResponse.next();
        }

        // Allow access to pending-approval only if profile is completed but not approved
        if (pathname === '/mentors/pending-approval') {
          if (!sessionData.profileCompleted) {
            console.log('📝 Profile not completed, redirecting to complete-profile');
            return NextResponse.redirect(new URL('/mentors/complete-profile', request.url));
          }
          if (sessionData.approvalStatus === 'approved') {
            console.log('✅ Mentor approved, redirecting to dashboard');
            return NextResponse.redirect(new URL('/mentors/dashboard', request.url));
          }
          console.log('✅ Allowing access to pending-approval');
          return NextResponse.next();
        }

        // For ALL other mentor routes (dashboard, community, etc.), require full approval
        if (!sessionData.profileCompleted) {
          console.log('📝 Profile not completed, redirecting to complete-profile');
          return NextResponse.redirect(new URL('/mentors/complete-profile', request.url));
        }
        
        if (sessionData.approvalStatus !== 'approved') {
          console.log('⏳ Mentor not approved, redirecting to pending-approval');
          return NextResponse.redirect(new URL('/mentors/pending-approval', request.url));
        }

        console.log('✅ Mentor fully approved, allowing access to', pathname);
        
      } catch (error) {
        console.error('❌ Error in middleware mentor check:', error);
        return NextResponse.redirect(new URL('/mentors-auth/login', request.url));
      }
    }
  }

  console.log('➡️ Allowing request to continue');
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/students/:path*',
    '/mentors/:path*',
    '/admin-login',
    '/students-auth/login',
    '/mentors-auth/login',
  ],
};