'use server';

import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildSafeAsync } from '@/lib/build-safe-auth';

// 🆕 Helper to check if we're in static build
function isStaticBuild() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

// 🆕 FIXED: Get current student - SIMPLIFIED WITHOUT buildSafeAsync
export async function getCurrentStudent() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentStudent');
      return null;
    }

    console.log('🔍 getCurrentStudent - Starting student detection...');
    
    const cookieStore = await cookies();
    const studentCookie = cookieStore.get('student-session-v2');
    
    if (!studentCookie?.value) {
      console.log('❌ getCurrentStudent - No student session cookie found');
      return null;
    }

    console.log('🔍 getCurrentStudent - Found student cookie, parsing...');
    
    let studentData;
    try {
      studentData = JSON.parse(studentCookie.value);
      console.log('🔍 getCurrentStudent - Parsed cookie data:', {
        id: studentData.id,
        email: studentData.email,
        role: studentData.role
      });
    } catch (parseError) {
      console.error('❌ getCurrentStudent - Error parsing cookie:', parseError);
      return null;
    }

    // Validate required fields
    if (!studentData.id || studentData.role !== 'student') {
      console.log('❌ getCurrentStudent - Invalid student data in cookie');
      return null;
    }

    console.log('🔍 getCurrentStudent - Connecting to database for student ID:', studentData.id);
    await connectDB();
    
    const student = await Student.findById(studentData.id).select('-password').lean();
    
    if (!student) {
      console.log('❌ getCurrentStudent - Student not found in database for ID:', studentData.id);
      // Clear invalid cookie
      cookieStore.delete('student-session-v2');
      return null;
    }

    console.log('✅ getCurrentStudent - Student found:', (student as any).name);
    
    const studentFromDB = student as any;
    
    return {
      _id: studentFromDB._id.toString(),
      id: studentFromDB._id.toString(),
      name: studentFromDB.name,
      email: studentFromDB.email,
      role: 'student',
      year: studentFromDB.year,
      college: studentFromDB.college,
      profilePhoto: studentFromDB.profilePhoto,
      profiles: studentFromDB.profiles || {},
      interests: studentFromDB.interests || [],
      createdAt: studentFromDB.createdAt,
      updatedAt: studentFromDB.updatedAt
    };
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentStudent');
      return null;
    }
    console.error('❌ getCurrentStudent - Unexpected error:', error);
    return null;
  }
}

// 🆕 FIXED: Get current mentor - IMPROVED COOKIE HANDLING
export async function getCurrentMentor() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentMentor');
      return null;
    }

    console.log('🔍 getCurrentMentor - Starting mentor detection...');
    
    const cookieStore = await cookies();
    const mentorCookie = cookieStore.get('mentor-session');
    
    console.log('🍪 Mentor cookie exists:', !!mentorCookie);
    
    if (!mentorCookie?.value) {
      console.log('❌ getCurrentMentor - No mentor session cookie found');
      return null;
    }

    console.log('🔍 getCurrentMentor - Found mentor cookie, parsing...');
    
    let mentorData;
    try {
      mentorData = JSON.parse(mentorCookie.value);
      console.log('🔍 getCurrentMentor - Parsed cookie data:', mentorData);
    } catch (parseError) {
      console.error('❌ getCurrentMentor - Error parsing cookie:', parseError);
      console.log('🔍 Raw cookie value (first 100 chars):', mentorCookie.value.substring(0, 100));
      return null;
    }

    // 🆕 FIX: Check for both mentorId and id for compatibility
    const mentorId = mentorData.mentorId || mentorData.id;
    
    // Validate required fields
    if (!mentorId) {
      console.log('❌ getCurrentMentor - No mentor ID found in cookie data:', mentorData);
      return null;
    }

    if (mentorData.role !== 'mentor') {
      console.log('❌ getCurrentMentor - Invalid role in cookie:', mentorData.role);
      return null;
    }

    console.log('🔍 getCurrentMentor - Connecting to database for mentor ID:', mentorId);
    
    await connectDB();
    const mentor = await Mentor.findById(mentorId).select('-password').lean();
    
    if (!mentor) {
      console.log('❌ getCurrentMentor - Mentor not found in database for ID:', mentorId);
      cookieStore.delete('mentor-session');
      return null;
    }

    console.log('✅ getCurrentMentor - Mentor found:', (mentor as any).name);
    
    const mentorFromDB = mentor as any;
    
    return {
      _id: mentorFromDB._id.toString(),
      id: mentorFromDB._id.toString(),
      mentorId: mentorFromDB._id.toString(), // 🆕 Ensure mentorId is always set
      name: mentorFromDB.name,
      email: mentorFromDB.email,
      role: 'mentor',
      expertise: mentorFromDB.expertise || [],
      college: mentorFromDB.college,
      profilePhoto: mentorFromDB.profilePhoto,
      profiles: mentorFromDB.profiles || {},
      experience: mentorFromDB.experience,
      bio: mentorFromDB.bio,
      profileCompleted: mentorFromDB.profileCompleted,
      approvalStatus: mentorFromDB.approvalStatus,
      createdAt: mentorFromDB.createdAt,
      updatedAt: mentorFromDB.updatedAt
    };
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentMentor');
      return null;
    }
    console.error('❌ getCurrentMentor - Unexpected error:', error);
    return null;
  }
}

// 🆕 CRITICAL FIX: Get current user - REMOVED INFINITE REDIRECT SOURCE
export async function getCurrentUser() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentUser');
      return null;
    }

    console.log('🔍 getCurrentUser - Trying to get user...');

    // Try mentor first, then student - NO COMPLEX ROUTE DETECTION
    const mentor = await getCurrentMentor();
    if (mentor) {
      console.log('✅ getCurrentUser - Using mentor session');
      return mentor;
    }
    
    const student = await getCurrentStudent();
    if (student) {
      console.log('✅ getCurrentUser - Using student session');
      return student;
    }
    
    console.log('❌ getCurrentUser - No sessions found');
    return null;
    
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentUser');
      return null;
    }
    console.error('❌ getCurrentUser - Error:', error);
    return null;
  }
}

// 🆕 FIXED: Logout functions - Return plain objects only
export async function studentLogout() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping studentLogout');
      return { 
        success: true, 
        message: 'Build mode - logout skipped',
        redirectUrl: '/students-auth/login'
      };
    }

    console.log('🔒 Student-only logout initiated');
    
    const cookieStore = await cookies();
    
    const studentCookies = [
      'student-data', 
      'user-data',
      'student-session-v2'
    ];
    
    // Clear cookies
    studentCookies.forEach(cookieName => {
      const hadCookie = !!cookieStore.get(cookieName);
      cookieStore.delete(cookieName);
      console.log(`🗑️ studentLogout - Deleted student cookie: ${cookieName} - ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
    });
    
    console.log('✅ studentLogout - All student cookies cleared');
    
    // 🆕 CRITICAL FIX: Return plain object instead of NextResponse
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
      redirectUrl: '/students-auth/login?logout=error'
    };
  }
}

export async function mentorLogout() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping mentorLogout');
      return { 
        success: true, 
        message: 'Build mode - logout skipped',
        redirectUrl: '/mentors-auth/login'
      };
    }

    console.log('🔒 Mentor-only logout initiated');
    
    const cookieStore = await cookies();
    
    const mentorCookies = [
      'mentor-session',
      'mentor-data'
    ];
    
    // Clear cookies
    mentorCookies.forEach(cookieName => {
      const hadCookie = !!cookieStore.get(cookieName);
      cookieStore.delete(cookieName);
      console.log(`🗑️ mentorLogout - Deleted mentor cookie: ${cookieName} - ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
    });
    
    console.log('✅ mentorLogout - All mentor cookies cleared');
    
    // 🆕 CRITICAL FIX: Return plain object instead of NextResponse
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
      redirectUrl: '/mentors-auth/login?logout=error'
    };
  }
}

// 🆕 HELPER FUNCTIONS
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

    if (!userData.id) {
      console.log('❌ getStudentFromCookie - No user ID found in cookie data');
      return null;
    }

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

    // 🆕 FIX: Check for both mentorId and id
    const mentorId = mentorData.mentorId || mentorData.id;

    if (!mentorId) {
      console.log('❌ getMentorFromCookie - No mentorId found in cookie data');
      return null;
    }

    if (mentorData.role !== 'mentor') {
      console.log('❌ getMentorFromCookie - Invalid role for mentor access:', mentorData.role);
      return null;
    }

    console.log('🔍 getMentorFromCookie - Connecting to database...');
    await connectDB();
    
    console.log('🔍 getMentorFromCookie - Searching for mentor with ID:', mentorId);
    const mentor = await Mentor.findById(mentorId).select('-password').lean();
    
    if (!mentor) {
      console.log('❌ getMentorFromCookie - Mentor not found in database for ID:', mentorId);
      return null;
    }

    console.log('✅ getMentorFromCookie - Mentor found in database:', (mentor as any).name);
    
    const mentorDataFromDB = mentor as any;
    
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
      profileCompleted: mentorDataFromDB.profileCompleted,
      approvalStatus: mentorDataFromDB.approvalStatus,
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

// 🆕 FIXED: Route-specific user fetching - IMPROVED MENTOR DETECTION
export async function getCurrentUserForMentorRoute() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentUserForMentorRoute');
      return null;
    }

    console.log('🔍 getCurrentUserForMentorRoute - Starting to fetch current user for mentor route...');
    
    const cookieStore = await cookies();
    
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

    if (mentorCookie?.value) {
      console.log('🔍 getCurrentUserForMentorRoute - Using mentor session for mentor route');
      
      // 🆕 FIX: Use the main getCurrentMentor function instead of getMentorFromCookie
      // This ensures consistent cookie parsing logic
      return await getCurrentMentor();
    }

    console.log('❌ getCurrentUserForMentorRoute - No mentor session found for mentor route');
    return null;
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentUserForMentorRoute');
      return null;
    }
    console.error('❌ getCurrentUserForMentorRoute - Unexpected error:', error);
    return null;
  }
}

export async function getCurrentUserForStudentRoute() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentUserForStudentRoute');
      return null;
    }

    console.log('🔍 getCurrentUserForStudentRoute - Starting to fetch current user for student route...');
    
    const cookieStore = await cookies();
    
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

    if (studentCookie?.value) {
      console.log('🔍 getCurrentUserForStudentRoute - Using student session for student route');
      return await getStudentFromCookie(studentCookie.value);
    }

    console.log('❌ getCurrentUserForStudentRoute - No student session found for student route');
    return null;
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentUserForStudentRoute');
      return null;
    }
    console.error('❌ getCurrentUserForStudentRoute - Unexpected error:', error);
    return null;
  }
}

// 🆕 FIXED: Session verification functions - NO REDIRECTS
export async function verifyStudentSession() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping verifyStudentSession');
      return { isValid: false, error: 'Build mode - skipping verification' };
    }

    const cookieStore = await cookies();
    
    const studentDataCookie = cookieStore.get('student-session-v2')?.value;

    if (!studentDataCookie) {
      return { isValid: false, error: 'No student session found' };
    }

    const studentData = JSON.parse(studentDataCookie);
    
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
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping verifyStudentSession');
      return { isValid: false, error: 'Build mode - skipping verification' };
    }
    console.error('❌ verifyStudentSession - Error:', error);
    return { isValid: false, error: 'Student session verification failed' };
  }
}

export async function verifyMentorSession() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping verifyMentorSession');
      return { isValid: false, error: 'Build mode - skipping verification' };
    }

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

    if (mentorData.role !== 'mentor') {
      console.log('❌ verifyMentorSession - Not a mentor session:', mentorData.role);
      return { isValid: false, error: 'Not a mentor session' };
    }

    // 🆕 FIX: Check for both mentorId and id
    const mentorId = mentorData.mentorId || mentorData.id;
    
    if (!mentorId) {
      console.log('❌ verifyMentorSession - No mentor ID found in mentor cookie data');
      return { isValid: false, error: 'No mentor ID found' };
    }

    await connectDB();
    
    const mentor = await Mentor.findById(mentorId).lean();
    
    if (!mentor) {
      console.log('❌ verifyMentorSession - Mentor not found in database for ID:', mentorId);
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
        bio: mentorDataFromDB.bio,
        profileCompleted: mentorDataFromDB.profileCompleted,
        approvalStatus: mentorDataFromDB.approvalStatus
      }
    };
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping verifyMentorSession');
      return { isValid: false, error: 'Build mode - skipping verification' };
    }
    console.error('❌ verifyMentorSession - Error:', error);
    return { isValid: false, error: 'Mentor session verification failed' };
  }
}

// 🆕 Auth check functions
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

// 🆕 CRITICAL FIX: requireStudentAuth - NO buildSafeAsync wrapper
export async function requireStudentAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping requireStudentAuth');
      return null;
    }

    console.log('🔐 requireStudentAuth - Starting strict authentication check');
    
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
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping requireStudentAuth');
      return null;
    }
    throw error;
  }
}

// 🆕 CRITICAL FIX: requireMentorAuth - NO buildSafeAsync wrapper
export async function requireMentorAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping requireMentorAuth');
      return null;
    }

    console.log('🔐 requireMentorAuth - Starting strict authentication check');
    
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
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping requireMentorAuth');
      return null;
    }
    throw error;
  }
}

// 🆕 Session checking for login pages
export async function checkExistingStudentAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping checkExistingStudentAuth');
      return false;
    }

    const session = await verifyStudentSession();
    
    if (session?.isValid) {
      console.log('✅ checkExistingStudentAuth - Student authenticated');
      return true;
    }
    
    console.log('✅ checkExistingStudentAuth - No student session');
    return false;
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping checkExistingStudentAuth');
      return false;
    }
    console.log('✅ checkExistingStudentAuth - Error, assuming no session');
    return false;
  }
}

export async function checkExistingMentorAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping checkExistingMentorAuth');
      return false;
    }

    const session = await verifyMentorSession();
    
    if (session?.isValid) {
      console.log('✅ checkExistingMentorAuth - Mentor authenticated');
      return true;
    }
    
    console.log('✅ checkExistingMentorAuth - No mentor session');
    return false;
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping checkExistingMentorAuth');
      return false;
    }
    console.log('✅ checkExistingMentorAuth - Error, assuming no session');
    return false;
  }
}

// 🆕 Session cleanup
export async function clearConflictingSessions(requiredRole: 'mentor' | 'student') {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping clearConflictingSessions');
      return false;
    }

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
        console.log('🧹 clearConflictingSessions - Clearing mentor session for student route access');
        cookieStore.delete('mentor-session');
        return true;
      }
    }
    
    return false;
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping clearConflictingSessions');
      return false;
    }
    console.error('❌ clearConflictingSessions - Error:', error);
    return false;
  }
}

// 🆕 Simple session checks - NO buildSafeAsync wrapper
export async function hasStudentSession() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping hasStudentSession');
      return false;
    }

    const cookieStore = await cookies();
    
    const studentDataCookie = cookieStore.get('student-session-v2')?.value;
    
    if (!studentDataCookie) {
      return false;
    }
    
    const studentData = JSON.parse(studentDataCookie);
    return studentData.role === 'student';
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping hasStudentSession');
      return false;
    }
    return false;
  }
}

export async function hasMentorSession() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping hasMentorSession');
      return false;
    }

    const cookieStore = await cookies();
    
    const mentorDataCookie = cookieStore.get('mentor-session')?.value;
    
    if (!mentorDataCookie) {
      return false;
    }
    
    const mentorData = JSON.parse(mentorDataCookie);
    return mentorData.role === 'mentor';
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping hasMentorSession');
      return false;
    }
    return false;
  }
}

// 🆕 General auth check - NO buildSafeAsync wrapper
export async function checkAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping checkAuth');
      return { 
        authenticated: false,
        user: null 
      };
    }

    const user = await getCurrentUser();
    return { 
      authenticated: !!user,
      user 
    };
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping checkAuth');
      return { 
        authenticated: false,
        user: null 
      };
    }
    console.error('❌ checkAuth - Error:', error);
    return { 
      authenticated: false,
      user: null 
    };
  }
}

// 🆕 Get user progress - NO COOKIES, so no wrapper needed
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

// Get user by ID with profile photo (for messaging) - NO COOKIES, so no wrapper needed
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

// Update user profile (for profile updates) - NO COOKIES, so no wrapper needed
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

// Get user data - NO COOKIES, so no wrapper needed
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

// 🆕 FIXED: Get current student session data (for client-side use) - NO buildSafeAsync wrapper
export async function getCurrentStudentSession() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentStudentSession');
      return { isLoggedIn: false, student: null };
    }

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
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentStudentSession');
      return { isLoggedIn: false, student: null };
    }
    console.error('❌ getCurrentStudentSession - Error:', error);
    return { isLoggedIn: false, student: null };
  }
}

// 🆕 FIXED: Get current mentor session data (for client-side use) - NO buildSafeAsync wrapper
export async function getCurrentMentorSession() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentMentorSession');
      return { isLoggedIn: false, mentor: null };
    }

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

    // 🆕 FIX: Check for both mentorId and id
    const mentorId = mentorData.mentorId || mentorData.id;
    
    if (!mentorId) {
      console.log('❌ getCurrentMentorSession - No mentor ID found in mentor cookie data');
      return { isLoggedIn: false, mentor: null };
    }

    await connectDB();
    
    // Use mentorId to find the mentor
    const mentor = await Mentor.findById(mentorId).lean();
    
    if (!mentor) {
      console.log('❌ getCurrentMentorSession - Mentor not found in database for ID:', mentorId);
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
        bio: mentorDataFromDB.bio,
        profileCompleted: mentorDataFromDB.profileCompleted,
        approvalStatus: mentorDataFromDB.approvalStatus
      }
    };
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping getCurrentMentorSession');
      return { isLoggedIn: false, mentor: null };
    }
    console.error('❌ getCurrentMentorSession - Error:', error);
    return { isLoggedIn: false, mentor: null };
  }
}

// 🆕 Enhanced authentication check for any authenticated user - NO buildSafeAsync wrapper
export async function requireAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping requireAuth');
      return null;
    }

    const user = await getCurrentUser();
    
    if (!user) {
      redirect('/students-auth/login?redirect=' + encodeURIComponent('/dashboard'));
    }
    
    return user;
  } catch (error) {
    // 🆕 Handle dynamic server usage gracefully
    if (error instanceof Error && error.message.includes('Dynamic server usage')) {
      console.log('🏗️ Static build - skipping requireAuth');
      return null;
    }
    throw error;
  }
}

// 🆕 ADD: Debug function to check cookie contents
export async function debugMentorCookie() {
  try {
    const cookieStore = await cookies();
    const mentorCookie = cookieStore.get('mentor-session');
    
    if (!mentorCookie) {
      return { exists: false, value: null };
    }
    
    let parsedValue;
    try {
      parsedValue = JSON.parse(mentorCookie.value);
    } catch (error) {
      parsedValue = { error: 'Failed to parse', raw: mentorCookie.value.substring(0, 100) };
    }
    
    return {
      exists: true,
      value: parsedValue,
      rawLength: mentorCookie.value.length
    };
  } catch (error) {
    // 🆕 FIX: Proper error handling for TypeScript
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { exists: false, error: errorMessage };
  }
}