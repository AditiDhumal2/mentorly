// actions/userActions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildSafeAsync } from '@/lib/build-safe-auth';

// 🆕 HELPER FUNCTIONS (MUST BE DEFINED BEFORE THEY'RE USED)
async function getStudentFromCookie(cookieValue: string) {
  try {
    console.log('🔍 getStudentFromCookie - Parsing student cookie...');
    
    const userData = JSON.parse(cookieValue);
    console.log('🔍 getStudentFromCookie - Parsed user data:', {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      role: userData.role
    });

    // Validate required fields
    if (!userData.id) {
      console.log('❌ getStudentFromCookie - No user ID found in cookie data');
      return null;
    }

    // STRICT validation - must be student role
    if (userData.role !== 'student') {
      console.log('❌ getStudentFromCookie - Invalid role for student access:', userData.role);
      return null;
    }

    console.log('🔍 getStudentFromCookie - Connecting to database...');
    await connectDB();
    
    console.log('🔍 getStudentFromCookie - Searching for student with ID:', userData.id);
    const user = await Student.findById(userData.id).select('-password').lean();
    
    if (!user) {
      console.log('❌ getStudentFromCookie - Student not found in database for ID:', userData.id);
      return null;
    }

    console.log('✅ getStudentFromCookie - Student found in database:', (user as any).name);
    
    const userDataFromDB = user as any;
    
    // Create a plain object without Mongoose methods
    const formattedUser = {
      _id: userDataFromDB._id.toString(),
      id: userDataFromDB._id.toString(),
      name: userDataFromDB.name,
      email: userDataFromDB.email,
      role: userDataFromDB.role,
      year: userDataFromDB.year,
      college: userDataFromDB.college,
      profilePhoto: userDataFromDB.profilePhoto,
      profiles: userDataFromDB.profiles || {},
      interests: userDataFromDB.interests || [],
      createdAt: userDataFromDB.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: userDataFromDB.updatedAt?.toISOString() || new Date().toISOString()
    };

    console.log('✅ getStudentFromCookie - Successfully returning student:', formattedUser.name);
    
    return formattedUser;
  } catch (error) {
    console.error('❌ getStudentFromCookie - Error:', error);
    return null;
  }
}

async function getMentorFromCookie(cookieValue: string) {
  try {
    console.log('🔍 getMentorFromCookie - Parsing mentor cookie...');
    
    const mentorData = JSON.parse(cookieValue);
    console.log('🔍 getMentorFromCookie - Parsed mentor data:', {
      mentorId: mentorData.mentorId,
      name: mentorData.name,
      email: mentorData.email,
      role: mentorData.role
    });

    // Check for mentorId instead of id
    if (!mentorData.mentorId) {
      console.log('❌ getMentorFromCookie - No mentorId found in cookie data');
      return null;
    }

    // Validate role
    if (mentorData.role !== 'mentor') {
      console.log('❌ getMentorFromCookie - Invalid role for mentor access:', mentorData.role);
      return null;
    }

    console.log('🔍 getMentorFromCookie - Connecting to database...');
    await connectDB();
    
    // Use mentorData.mentorId to find the mentor
    console.log('🔍 getMentorFromCookie - Searching for mentor with ID:', mentorData.mentorId);
    const mentor = await Mentor.findById(mentorData.mentorId).select('-password').lean();
    
    if (!mentor) {
      console.log('❌ getMentorFromCookie - Mentor not found in database for ID:', mentorData.mentorId);
      return null;
    }

    console.log('✅ getMentorFromCookie - Mentor found in database:', (mentor as any).name);
    
    const mentorDataFromDB = mentor as any;
    
    // Create a plain object without Mongoose methods
    const formattedMentor = {
      _id: mentorDataFromDB._id.toString(),
      id: mentorDataFromDB._id.toString(),
      mentorId: mentorDataFromDB._id.toString(),
      name: mentorDataFromDB.name,
      email: mentorDataFromDB.email,
      role: mentorDataFromDB.role,
      expertise: mentorDataFromDB.expertise || [],
      college: mentorDataFromDB.college,
      profilePhoto: mentorDataFromDB.profilePhoto,
      profiles: mentorDataFromDB.profiles || {},
      experience: mentorDataFromDB.experience,
      bio: mentorDataFromDB.bio,
      createdAt: mentorDataFromDB.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: mentorDataFromDB.updatedAt?.toISOString() || new Date().toISOString()
    };

    console.log('✅ getMentorFromCookie - Successfully returning mentor:', formattedMentor.name);
    
    return formattedMentor;
  } catch (error) {
    console.error('❌ getMentorFromCookie - Error:', error);
    return null;
  }
}

// 🆕 MAIN AUTH FUNCTIONS (ALL WRAPPED IN buildSafeAsync)

export async function getCurrentUser(request?: any) {
  return buildSafeAsync(async () => {
    try {
      console.log('🔍 getCurrentUser - Starting to fetch current user...');
      
      const cookieStore = await cookies();
      
      // Get ALL cookies for debugging
      const allCookies = cookieStore.getAll();
      console.log('🍪 getCurrentUser - All available cookies:', allCookies.map(c => c.name));
      
      // Check for all session types
      const studentCookie = cookieStore.get('student-session-v2');
      const mentorCookie = cookieStore.get('mentor-session');
      const adminCookie = cookieStore.get('admin-data');

      console.log('🔍 getCurrentUser - Session cookies found:', {
        student: !!studentCookie,
        mentor: !!mentorCookie,
        admin: !!adminCookie
      });

      // 🆕 CRITICAL FIX: Get path from multiple sources
      let path = '';
      try {
        // Method 1: Try to get from headers (for server components)
        const headers = await import('next/headers');
        const headerList = await headers.headers();
        const invokePath = headerList.get('x-invoke-path');
        const nextUrl = headerList.get('next-url');
        
        if (invokePath) {
          path = invokePath;
        } else if (nextUrl) {
          path = nextUrl;
        }
      } catch (e) {
        console.log('🔍 getCurrentUser - No headers context available');
      }

      // Method 2: Use the request if provided (for middleware)
      if (request?.nextUrl?.pathname) {
        path = request.nextUrl.pathname;
      }

      console.log('🛣️ getCurrentUser - Detected path:', path || 'NOT_AVAILABLE');

      // 🆕 CRITICAL: Route-based session selection
      if (path && path.includes('/mentors') && mentorCookie?.value) {
        console.log('🎯 getCurrentUser - Using MENTOR session for mentor route');
        const mentor = await getMentorFromCookie(mentorCookie.value);
        if (mentor) return mentor;
        
        // If mentor session is invalid, clear it
        console.log('🧹 Clearing invalid mentor session');
        cookieStore.delete('mentor-session');
      }

      if (path && path.includes('/students') && studentCookie?.value) {
        console.log('🎯 getCurrentUser - Using STUDENT session for student route');
        const student = await getStudentFromCookie(studentCookie.value);
        if (student) return student;
        
        // If student session is invalid, clear it
        console.log('🧹 Clearing invalid student session');
        cookieStore.delete('student-session-v2');
      }

      // 🆕 SECURITY: If we're on mentor route but no valid mentor session, don't fall back to student
      if (path && path.includes('/mentors') && !mentorCookie?.value) {
        console.log('🚫 SECURITY: Mentor route accessed without mentor session - no fallback');
        return null;
      }

      // 🆕 SECURITY: If we're on student route but no valid student session, don't fall back to mentor
      if (path && path.includes('/students') && !studentCookie?.value) {
        console.log('🚫 SECURITY: Student route accessed without student session - no fallback');
        return null;
      }

      // 🆕 FALLBACK: When path is not available, use context-aware approach
      // Prefer mentor session as it's more restrictive
      if (mentorCookie?.value) {
        console.log('🔍 getCurrentUser - Using mentor session (context fallback)');
        const mentor = await getMentorFromCookie(mentorCookie.value);
        if (mentor) return mentor;
      }
      
      if (studentCookie?.value) {
        console.log('🔍 getCurrentUser - Using student session (context fallback)');
        const student = await getStudentFromCookie(studentCookie.value);
        if (student) return student;
      }
      
      if (adminCookie?.value) {
        console.log('🔍 getCurrentUser - Using admin session');
        // Add admin session handling if needed
      }

      console.log('❌ getCurrentUser - No valid session cookie found');
      return null;
    } catch (error) {
      console.error('❌ getCurrentUser - Unexpected error:', error);
      return null;
    }
  });
}

export async function getCurrentUserForMentorRoute() {
  return buildSafeAsync(async () => {
    try {
      console.log('🔍 getCurrentUserForMentorRoute - Starting to fetch current user for mentor route...');
      
      const cookieStore = await cookies();
      
      // For mentor routes, ONLY check mentor session
      const mentorCookie = cookieStore.get('mentor-session');
      const studentCookie = cookieStore.get('student-session-v2');

      console.log('🔍 getCurrentUserForMentorRoute - Session cookies found:', {
        student: !!studentCookie,
        mentor: !!mentorCookie
      });

      // 🆕 SECURITY: Clear student session if trying to access mentor route
      if (studentCookie?.value) {
        console.log('🧹 SECURITY: Clearing student session for mentor route access');
        cookieStore.delete('student-session-v2');
      }

      // 🆕 SECURITY: For mentor routes, prioritize MENTOR session only
      if (mentorCookie?.value) {
        console.log('🔍 getCurrentUserForMentorRoute - Using mentor session for mentor route');
        return await getMentorFromCookie(mentorCookie.value);
      }

      console.log('❌ getCurrentUserForMentorRoute - No mentor session found for mentor route');
      return null;
    } catch (error) {
      console.error('❌ getCurrentUserForMentorRoute - Unexpected error:', error);
      return null;
    }
  });
}

export async function getCurrentUserForStudentRoute() {
  return buildSafeAsync(async () => {
    try {
      console.log('🔍 getCurrentUserForStudentRoute - Starting to fetch current user for student route...');
      
      const cookieStore = await cookies();
      
      // For student routes, ONLY check student session
      const studentCookie = cookieStore.get('student-session-v2');
      const mentorCookie = cookieStore.get('mentor-session');

      console.log('🔍 getCurrentUserForStudentRoute - Session cookies found:', {
        student: !!studentCookie,
        mentor: !!mentorCookie
      });

      // 🆕 SECURITY: Clear mentor session if trying to access student route
      if (mentorCookie?.value) {
        console.log('🧹 SECURITY: Clearing mentor session for student route access');
        cookieStore.delete('mentor-session');
      }

      // 🆕 SECURITY: For student routes, prioritize STUDENT session only
      if (studentCookie?.value) {
        console.log('🔍 getCurrentUserForStudentRoute - Using student session for student route');
        return await getStudentFromCookie(studentCookie.value);
      }

      console.log('❌ getCurrentUserForStudentRoute - No student session found for student route');
      return null;
    } catch (error) {
      console.error('❌ getCurrentUserForStudentRoute - Unexpected error:', error);
      return null;
    }
  });
}

export async function verifyStudentSession() {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      const studentDataCookie = cookieStore.get('student-session-v2')?.value;

      if (!studentDataCookie) {
        return { isValid: false, error: 'No student session found' };
      }

      const studentData = JSON.parse(studentDataCookie);
      
      // Verify it's actually a student session
      if (studentData.role !== 'student') {
        return { isValid: false, error: 'Not a student session' };
      }

      await connectDB();
      const student = await Student.findById(studentData.id).lean();
      
      if (!student) {
        return { isValid: false, error: 'Student account not found' };
      }

      const studentDataFromDB = student as any;
      
      return { 
        isValid: true, 
        student: {
          id: studentDataFromDB._id.toString(),
          _id: studentDataFromDB._id.toString(),
          name: studentDataFromDB.name,
          email: studentDataFromDB.email,
          role: 'student',
          year: studentDataFromDB.year,
          college: studentDataFromDB.college,
          profilePhoto: studentDataFromDB.profilePhoto,
          profiles: studentDataFromDB.profiles || {},
          interests: studentDataFromDB.interests || []
        }
      };
    } catch (error) {
      console.error('❌ verifyStudentSession - Error:', error);
      return { isValid: false, error: 'Student session verification failed' };
    }
  });
}

export async function verifyMentorSession() {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      const mentorDataCookie = cookieStore.get('mentor-session')?.value;

      if (!mentorDataCookie) {
        console.log('❌ verifyMentorSession - No mentor session cookie found');
        return { isValid: false, error: 'No mentor session found' };
      }

      let mentorData;
      try {
        mentorData = JSON.parse(mentorDataCookie);
        console.log('🔍 verifyMentorSession - Parsed mentor cookie data:', mentorData);
      } catch (parseError) {
        console.error('❌ verifyMentorSession - Error parsing mentor cookie:', parseError);
        return { isValid: false, error: 'Invalid mentor session data' };
      }

      // Verify it's actually a mentor session
      if (mentorData.role !== 'mentor') {
        console.log('❌ verifyMentorSession - Not a mentor session:', mentorData.role);
        return { isValid: false, error: 'Not a mentor session' };
      }

      // Check for mentorId instead of id
      if (!mentorData.mentorId) {
        console.log('❌ verifyMentorSession - No mentorId found in mentor cookie data');
        return { isValid: false, error: 'No mentor ID found' };
      }

      await connectDB();
      
      // Use mentorData.mentorId to find the mentor
      const mentor = await Mentor.findById(mentorData.mentorId).lean();
      
      if (!mentor) {
        console.log('❌ verifyMentorSession - Mentor not found in database for ID:', mentorData.mentorId);
        return { isValid: false, error: 'Mentor account not found' };
      }

      console.log('✅ verifyMentorSession - Mentor found in database:', (mentor as any).name);
      
      const mentorDataFromDB = mentor as any;
      
      return { 
        isValid: true, 
        mentor: {
          id: mentorDataFromDB._id.toString(),
          _id: mentorDataFromDB._id.toString(),
          mentorId: mentorDataFromDB._id.toString(),
          name: mentorDataFromDB.name,
          email: mentorDataFromDB.email,
          role: 'mentor',
          expertise: mentorDataFromDB.expertise || [],
          college: mentorDataFromDB.college,
          profilePhoto: mentorDataFromDB.profilePhoto,
          profiles: mentorDataFromDB.profiles || {},
          experience: mentorDataFromDB.experience,
          bio: mentorDataFromDB.bio
        }
      };
    } catch (error) {
      console.error('❌ verifyMentorSession - Error:', error);
      return { isValid: false, error: 'Mentor session verification failed' };
    }
  });
}

// For student dashboard - NO REDIRECT, just return status
export async function checkStudentAuth() {
  const session = await verifyStudentSession();
  
  if (!session?.isValid || !session.student) {
    console.log('🛑 checkStudentAuth - No valid student session');
    return { authenticated: false, student: null };
  }
  
  console.log('✅ checkStudentAuth - Student session valid for:', session.student.email);
  
  return {
    authenticated: true,
    student: session.student
  };
}

// For mentor dashboard - NO REDIRECT, just return status
export async function checkMentorAuth() {
  const session = await verifyMentorSession();
  
  if (!session?.isValid || !session.mentor) {
    console.log('🛑 checkMentorAuth - No valid mentor session');
    return { authenticated: false, mentor: null };
  }
  
  console.log('✅ checkMentorAuth - Mentor session valid for:', session.mentor.email);
  
  return {
    authenticated: true,
    mentor: session.mentor
  };
}

// Student-only logout - NO REDIRECTS
export async function studentLogout() {
  return buildSafeAsync(async () => {
    try {
      console.log('🔒 Student-only logout initiated');
      
      const cookieStore = await cookies();
      
      // Clear ALL student-related cookies including new one
      const studentCookies = [
        'student-data', 
        'user-data',
        'student-session-v2'
      ];
      
      studentCookies.forEach(cookieName => {
        const hadCookie = !!cookieStore.get(cookieName);
        cookieStore.delete(cookieName);
        console.log(`🗑️ studentLogout - Deleted student cookie: ${cookieName} - ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
      });
      
      // Verify student cookies are cleared but admin/mentor cookies remain
      const studentDataAfter = cookieStore.get('student-data');
      const userDataAfter = cookieStore.get('user-data');
      const studentSessionV2After = cookieStore.get('student-session-v2');
      const adminDataAfter = cookieStore.get('admin-data');
      const mentorSessionAfter = cookieStore.get('mentor-session');
      
      console.log('✅ studentLogout - Verification:', {
        studentDataAfter: studentDataAfter ? 'STILL_EXISTS' : 'DELETED',
        userDataAfter: userDataAfter ? 'STILL_EXISTS' : 'DELETED',
        studentSessionV2After: studentSessionV2After ? 'STILL_EXISTS' : 'DELETED',
        adminDataAfter: adminDataAfter ? 'STILL_EXISTS' : 'DELETED',
        mentorSessionAfter: mentorSessionAfter ? 'STILL_EXISTS' : 'DELETED'
      });

      console.log('✅ studentLogout - All student cookies cleared, admin/mentor sessions preserved');
      
      return { 
        success: true, 
        message: 'Student logout successful',
        redirectUrl: '/students-auth/login?logout=success&t=' + Date.now()
      };
    } catch (error) {
      console.error('❌ studentLogout - Error:', error);
      return { 
        success: false, 
        message: 'Logout failed',
        redirectUrl: '/students-auth/login'
      };
    }
  });
}

// Mentor-only logout - NO REDIRECTS
export async function mentorLogout() {
  return buildSafeAsync(async () => {
    try {
      console.log('🔒 Mentor-only logout initiated');
      
      const cookieStore = await cookies();
      
      // Clear mentor-related cookies
      const mentorCookies = [
        'mentor-session',
        'mentor-data'
      ];
      
      mentorCookies.forEach(cookieName => {
        const hadCookie = !!cookieStore.get(cookieName);
        cookieStore.delete(cookieName);
        console.log(`🗑️ mentorLogout - Deleted mentor cookie: ${cookieName} - ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
      });
      
      // Verify mentor cookies are cleared but student/admin cookies remain
      const mentorSessionAfter = cookieStore.get('mentor-session');
      const mentorDataAfter = cookieStore.get('mentor-data');
      const studentSessionV2After = cookieStore.get('student-session-v2');
      const adminDataAfter = cookieStore.get('admin-data');
      
      console.log('✅ mentorLogout - Verification:', {
        mentorSessionAfter: mentorSessionAfter ? 'STILL_EXISTS' : 'DELETED',
        mentorDataAfter: mentorDataAfter ? 'STILL_EXISTS' : 'DELETED',
        studentSessionV2After: studentSessionV2After ? 'STILL_EXISTS' : 'DELETED',
        adminDataAfter: adminDataAfter ? 'STILL_EXISTS' : 'DELETED'
      });

      console.log('✅ mentorLogout - All mentor cookies cleared, student/admin sessions preserved');
      
      return { 
        success: true, 
        message: 'Mentor logout successful',
        redirectUrl: '/mentors-auth/login?logout=success&t=' + Date.now()
      };
    } catch (error) {
      console.error('❌ mentorLogout - Error:', error);
      return { 
        success: false, 
        message: 'Logout failed',
        redirectUrl: '/mentors-auth/login'
      };
    }
  });
}

// STRICT Server-side protection for student pages
export async function requireStudentAuth() {
  return buildSafeAsync(async () => {
    console.log('🔐 requireStudentAuth - Starting strict authentication check');
    
    // 🆕 Use route-specific function
    const user = await getCurrentUserForStudentRoute();
    
    if (!user) {
      console.log('❌ requireStudentAuth - No user found, redirecting to login');
      redirect('/students-auth/login?error=no_user&redirect=/students');
    }
    
    if (user.role !== 'student') {
      console.log('❌ requireStudentAuth - Invalid role, redirecting to login');
      redirect('/students-auth/login?error=invalid_role&redirect=/students');
    }
    
    console.log('✅ requireStudentAuth - Student authenticated:', user.name);
    return user;
  });
}

// STRICT Server-side protection for mentor pages
export async function requireMentorAuth() {
  return buildSafeAsync(async () => {
    console.log('🔐 requireMentorAuth - Starting strict authentication check');
    
    // 🆕 Use route-specific function
    const user = await getCurrentUserForMentorRoute();
    
    if (!user) {
      console.log('❌ requireMentorAuth - No user found, redirecting to login');
      redirect('/mentors-auth/login?error=no_user&redirect=/mentors');
    }
    
    if (user.role !== 'mentor') {
      console.log('❌ requireMentorAuth - Invalid role, redirecting to login');
      redirect('/mentors-auth/login?error=invalid_role&redirect=/mentors');
    }
    
    console.log('✅ requireMentorAuth - Mentor authenticated:', user.name);
    return user;
  });
}

// Enhanced authentication check for any authenticated user
export async function requireAuth() {
  return buildSafeAsync(async () => {
    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/students-auth/login?redirect=' + encodeURIComponent('/dashboard'));
    }
    
    return user;
  });
}

// Get current student session data (for client-side use)
export async function getCurrentStudentSession() {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      const studentDataCookie = cookieStore.get('student-session-v2')?.value;

      if (!studentDataCookie) {
        return { isLoggedIn: false, student: null };
      }

      const studentData = JSON.parse(studentDataCookie);
      
      // Only return if it's actually a student session
      if (studentData.role !== 'student') {
        return { isLoggedIn: false, student: null };
      }
      
      return { 
        isLoggedIn: true, 
        student: studentData 
      };
    } catch (error) {
      console.error('❌ getCurrentStudentSession - Error:', error);
      return { isLoggedIn: false, student: null };
    }
  });
}

// Get current mentor session data (for client-side use)
export async function getCurrentMentorSession() {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      const mentorDataCookie = cookieStore.get('mentor-session')?.value;

      if (!mentorDataCookie) {
        console.log('❌ getCurrentMentorSession - No mentor session cookie found');
        return { isLoggedIn: false, mentor: null };
      }

      let mentorData;
      try {
        mentorData = JSON.parse(mentorDataCookie);
        console.log('🔍 getCurrentMentorSession - Parsed mentor cookie data:', mentorData);
      } catch (parseError) {
        console.error('❌ getCurrentMentorSession - Error parsing mentor cookie:', parseError);
        return { isLoggedIn: false, mentor: null };
      }

      // Only return if it's actually a mentor session
      if (mentorData.role !== 'mentor') {
        console.log('❌ getCurrentMentorSession - Not a mentor session:', mentorData.role);
        return { isLoggedIn: false, mentor: null };
      }

      // Check for mentorId instead of id
      if (!mentorData.mentorId) {
        console.log('❌ getCurrentMentorSession - No mentorId found in mentor cookie data');
        return { isLoggedIn: false, mentor: null };
      }

      await connectDB();
      
      // Use mentorData.mentorId to find the mentor
      const mentor = await Mentor.findById(mentorData.mentorId).lean();
      
      if (!mentor) {
        console.log('❌ getCurrentMentorSession - Mentor not found in database for ID:', mentorData.mentorId);
        return { isLoggedIn: false, mentor: null };
      }

      console.log('✅ getCurrentMentorSession - Mentor found in database:', (mentor as any).name);
      
      const mentorDataFromDB = mentor as any;
      
      return { 
        isLoggedIn: true, 
        mentor: {
          id: mentorDataFromDB._id.toString(),
          _id: mentorDataFromDB._id.toString(),
          mentorId: mentorDataFromDB._id.toString(),
          name: mentorDataFromDB.name,
          email: mentorDataFromDB.email,
          role: 'mentor',
          expertise: mentorDataFromDB.expertise || [],
          college: mentorDataFromDB.college,
          profilePhoto: mentorDataFromDB.profilePhoto,
          profiles: mentorDataFromDB.profiles || {},
          experience: mentorDataFromDB.experience,
          bio: mentorDataFromDB.bio
        }
      };
    } catch (error) {
      console.error('❌ getCurrentMentorSession - Error:', error);
      return { isLoggedIn: false, mentor: null };
    }
  });
}

// 🆕 NEW: Check existing student auth for login page
export async function checkExistingStudentAuth() {
  return buildSafeAsync(async () => {
    try {
      const session = await verifyStudentSession();
      
      if (session?.isValid) {
        console.log('✅ checkExistingStudentAuth - Student authenticated');
        return true;
      }
      
      console.log('✅ checkExistingStudentAuth - No student session');
      return false;
    } catch (error) {
      console.log('✅ checkExistingStudentAuth - Error, assuming no session');
      return false;
    }
  });
}

// 🆕 NEW: Check existing mentor auth for login page
export async function checkExistingMentorAuth() {
  return buildSafeAsync(async () => {
    try {
      const session = await verifyMentorSession();
      
      if (session?.isValid) {
        console.log('✅ checkExistingMentorAuth - Mentor authenticated');
        return true;
      }
      
      console.log('✅ checkExistingMentorAuth - No mentor session');
      return false;
    } catch (error) {
      console.log('✅ checkExistingMentorAuth - Error, assuming no session');
      return false;
    }
  });
}

// 🆕 NEW: Session cleanup utility
export async function clearConflictingSessions(requiredRole: 'mentor' | 'student') {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      if (requiredRole === 'mentor') {
        const studentCookie = cookieStore.get('student-session-v2');
        if (studentCookie) {
          console.log('🧹 clearConflictingSessions - Clearing student session for mentor access');
          cookieStore.delete('student-session-v2');
          return true;
        }
      }
      
      if (requiredRole === 'student') {
        const mentorCookie = cookieStore.get('mentor-session');
        if (mentorCookie) {
          console.log('🧹 clearConflictingSessions - Clearing mentor session for student access');
          cookieStore.delete('mentor-session');
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('❌ clearConflictingSessions - Error:', error);
      return false;
    }
  });
}

// 🆕 NEW: Check if student session exists without validation (for middleware)
export async function hasStudentSession() {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      const studentDataCookie = cookieStore.get('student-session-v2')?.value;
      
      if (!studentDataCookie) {
        return false;
      }
      
      const studentData = JSON.parse(studentDataCookie);
      return studentData.role === 'student';
    } catch (error) {
      return false;
    }
  });
}

// 🆕 NEW: Check if mentor session exists without validation (for middleware)
export async function hasMentorSession() {
  return buildSafeAsync(async () => {
    try {
      const cookieStore = await cookies();
      
      const mentorDataCookie = cookieStore.get('mentor-session')?.value;
      
      if (!mentorDataCookie) {
        return false;
      }
      
      const mentorData = JSON.parse(mentorDataCookie);
      return mentorData.role === 'mentor';
    } catch (error) {
      return false;
    }
  });
}

// 🆕 NEW: Fixed authentication check without headers modification
export async function checkAuth() {
  return buildSafeAsync(async () => {
    try {
      const user = await getCurrentUser();
      return { 
        authenticated: !!user,
        user 
      };
    } catch (error) {
      console.error('❌ checkAuth - Error:', error);
      return { 
        authenticated: false,
        user: null 
      };
    }
  });
}

// 🆕 NEW: Get user by ID with profile photo (for messaging) - NO COOKIES, so no wrapper needed
export async function getUserById(userId: string) {
  try {
    console.log('🔍 getUserById - Fetching user by ID:', userId);
    
    await connectDB();
    
    // Try student first, then mentor
    let user = await Student.findById(userId).select('name email role profilePhoto').lean();
    let userType = 'student';
    
    if (!user) {
      user = await Mentor.findById(userId).select('name email role profilePhoto').lean();
      userType = 'mentor';
    }
    
    if (!user) {
      console.log('❌ getUserById - User not found for ID:', userId);
      return null;
    }

    console.log('✅ getUserById - Found user:', (user as any).name, `(${userType})`);

    const userData = user as any;
    
    return {
      _id: userData._id.toString(),
      id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      profilePhoto: userData.profilePhoto
    };
  } catch (error) {
    console.error('❌ getUserById - Error:', error);
    return null;
  }
}

// 🆕 NEW: Update user profile (for profile updates) - NO COOKIES, so no wrapper needed
export async function updateUserProfile(
  userId: string, 
  userRole: 'student' | 'mentor', 
  updates: any
) {
  try {
    console.log('🔍 updateUserProfile - Updating profile for:', { userId, userRole, updates });
    
    await connectDB();

    let result;
    if (userRole === 'student') {
      result = await Student.findByIdAndUpdate(
        userId, 
        { $set: updates },
        { new: true }
      ).select('-password').lean();
    } else if (userRole === 'mentor') {
      result = await Mentor.findByIdAndUpdate(
        userId, 
        { $set: updates },
        { new: true }
      ).select('-password').lean();
    }

    if (!result) {
      console.log('❌ updateUserProfile - User not found for ID:', userId);
      return { success: false, error: 'User not found' };
    }

    console.log('✅ updateUserProfile - Profile updated successfully');
    
    const userData = result as any;
    
    return {
      success: true,
      user: {
        _id: userData._id.toString(),
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        profilePhoto: userData.profilePhoto,
        year: userData.year,
        college: userData.college,
        expertise: userData.expertise || [],
        interests: userData.interests || [],
        experience: userData.experience,
        bio: userData.bio
      }
    };
  } catch (error) {
    console.error('❌ updateUserProfile - Error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// 🆕 NEW: Get user data - NO COOKIES, so no wrapper needed
export async function getUserData(userId: string) {
  try {
    console.log('🔍 getUserData - Fetching data for user ID:', userId);
    
    await connectDB();
    
    // Try student first, then mentor
    let user = await Student.findById(userId).select('-password').lean();
    let userType = 'student';
    
    if (!user) {
      user = await Mentor.findById(userId).select('-password').lean();
      userType = 'mentor';
    }
    
    if (!user) {
      console.log('❌ getUserData - User not found for ID:', userId);
      throw new Error('User not found');
    }

    console.log('🔍 getUserData - Found user:', (user as any).name, `(${userType})`);

    const userData = user as any;
    
    // Create plain object
    const formattedUser = {
      _id: userData._id.toString(),
      id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      year: userData.year,
      college: userData.college,
      profilePhoto: userData.profilePhoto,
      profiles: userData.profiles || {},
      interests: userData.interests || [],
      expertise: userData.expertise || [],
      experience: userData.experience,
      bio: userData.bio,
      createdAt: userData.createdAt?.toISOString() || new Date().toISOString(),
      updatedAt: userData.updatedAt?.toISOString() || new Date().toISOString()
    };

    console.log('✅ getUserData - Successfully formatted user data');
    return formattedUser;
  } catch (error) {
    console.error('❌ getUserData - Error:', error);
    throw new Error('Failed to fetch user data');
  }
}

// 🆕 NEW: Get user progress - NO COOKIES, so no wrapper needed
export async function getUserProgress(userId: string) {
  try {
    console.log('🔍 getUserProgress - Fetching progress for user ID:', userId);
    
    await connectDB();
    
    // Try student first
    let user = await Student.findById(userId).select('roadmapProgress brandingProgress savedResources year').lean();
    let userType = 'student';
    
    if (!user) {
      // If not student, try mentor (mentors might have different progress tracking)
      user = await Mentor.findById(userId).select('expertise experience').lean();
      userType = 'mentor';
    }
    
    if (!user) {
      console.log('❌ getUserProgress - User not found for ID:', userId);
      throw new Error('User not found');
    }

    const userData = user as any;

    if (userType === 'student') {
      console.log('🔍 getUserProgress - Raw student progress data:', {
        roadmapProgress: userData.roadmapProgress,
        brandingProgress: userData.brandingProgress,
        savedResources: userData.savedResources
      });

      // Student progress calculation
      const completedRoadmapSteps = userData.roadmapProgress?.filter((p: any) => p.completed).length || 0;
      const completedBrandingTasks = userData.brandingProgress?.filter((p: any) => p.completed).length || 0;
      const savedResourcesCount = userData.savedResources?.length || 0;

      console.log('🔍 getUserProgress - Student progress calculations:', {
        completedRoadmapSteps,
        completedBrandingTasks,
        savedResourcesCount
      });

      // Calculate percentages
      const roadmapProgress = Math.min(completedRoadmapSteps * 5, 100);
      const brandingProgress = Math.min(completedBrandingTasks * 10, 100);

      console.log('🔍 getUserProgress - Student calculated percentages:', {
        roadmapProgress,
        brandingProgress
      });

      // Recent activity for student
      const recentActivity = [
        { type: 'account', title: 'Account Created', time: 'Just now' },
        { type: 'welcome', title: 'Welcome to CareerCompanion', time: 'Just now' },
      ];

      // Add actual progress activities if they exist
      if (completedRoadmapSteps > 0) {
        recentActivity.unshift({
          type: 'roadmap',
          title: `Completed ${completedRoadmapSteps} roadmap steps`,
          time: 'Recently'
        });
      }

      if (completedBrandingTasks > 0) {
        recentActivity.unshift({
          type: 'branding', 
          title: `Completed ${completedBrandingTasks} branding tasks`,
          time: 'Recently'
        });
      }

      const progressData = {
        roadmapProgress,
        brandingProgress,
        savedResources: savedResourcesCount,
        recentActivity: recentActivity.slice(0, 5),
        userType: 'student'
      };

      console.log('✅ getUserProgress - Final student progress data:', progressData);
      return progressData;
    } else {
      // Mentor progress (different metrics)
      console.log('🔍 getUserProgress - Mentor data:', {
        expertise: userData.expertise,
        experience: userData.experience
      });

      const expertiseCount = userData.expertise?.length || 0;
      const experienceLevel = userData.experience || 'beginner';
      
      // Simple mentor progress calculation based on expertise and experience
      let mentorProgress = 0;
      if (expertiseCount >= 5) mentorProgress = 100;
      else if (expertiseCount >= 3) mentorProgress = 75;
      else if (expertiseCount >= 1) mentorProgress = 50;
      else mentorProgress = 25;

      const recentActivity = [
        { type: 'account', title: 'Mentor Account Created', time: 'Just now' },
        { type: 'welcome', title: 'Welcome to Mentor Platform', time: 'Just now' },
      ];

      if (expertiseCount > 0) {
        recentActivity.unshift({
          type: 'expertise',
          title: `Added ${expertiseCount} areas of expertise`,
          time: 'Recently'
        });
      }

      const progressData = {
        mentorProgress,
        expertiseCount,
        experienceLevel,
        recentActivity: recentActivity.slice(0, 5),
        userType: 'mentor'
      };

      console.log('✅ getUserProgress - Final mentor progress data:', progressData);
      return progressData;
    }
  } catch (error) {
    console.error('❌ getUserProgress - Error:', error);
    return {
      roadmapProgress: 0,
      brandingProgress: 0,
      savedResources: 0,
      recentActivity: [
        { type: 'welcome', title: 'Welcome to CareerCompanion', time: 'Just now' },
      ],
      userType: 'student'
    };
  }
}