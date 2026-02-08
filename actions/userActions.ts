'use server';

import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import { Mentor } from '@/models/Mentor';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildSafeAsync } from '@/lib/build-safe-auth';
import bcrypt from 'bcryptjs';

// 🆕 Helper to check if we're in static build
function isStaticBuild() {
  return process.env.NEXT_PHASE === 'phase-production-build';
}

// 🆕 Netlify-specific: Get current domain for cookie setting
function getCookieDomain() {
  // On Netlify production
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_URL) {
    return `.${process.env.VERCEL_URL.replace('https://', '')}`;
  }
  // On local development
  return undefined;
}

// 🚀 CRITICAL FIX: Student Login - NETLIFY COMPATIBLE VERSION
export async function studentLogin(formData: FormData) {
  try {
    console.log('🌐 Production Login - Starting on:', {
      nodeEnv: process.env.NODE_ENV,
      isNetlify: !!process.env.NETLIFY,
      timestamp: new Date().toISOString(),
    });

    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 studentLogin - Student login attempt for:', email);

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const student = await Student.findOne({ 
      email: email.toLowerCase().trim()
    }).select('+password');
    
    if (!student) {
      console.log('❌ studentLogin - No student account found for:', email);
      return { success: false, error: 'No student account found with this email.' };
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      console.log('❌ studentLogin - Invalid password for:', email);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Create student session data
    const studentData = {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: 'student',
      year: student.year,
      college: student.college,
      profilePhoto: student.profilePhoto,
      timestamp: Date.now()
    };

    console.log('✅ studentLogin - Student login successful for:', student.name);

    const cookieStore = await cookies();
    
    // Clear old cookies
    const oldCookies = ['student-data', 'user-data', 'student-session-v2'];
    oldCookies.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });

    // 🚀 NETLIFY FIX: Updated cookie settings for production
    cookieStore.set('student-session-v2', JSON.stringify(studentData), {
      secure: true, // ALWAYS true for Netlify (they use HTTPS)
      sameSite: 'lax', // Use 'lax' for cross-site cookies
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
      // Important: Don't set domain for Netlify subdomains
      // domain: getCookieDomain(), // Comment out for Netlify
    });

    console.log('✅ studentLogin - Session cookie set for Netlify');
    
    return { 
      success: true, 
      error: null,
      session: studentData,
      redirectUrl: '/students' // Explicit redirect URL
    };
    
  } catch (error) {
    console.error('❌ studentLogin - Error on Netlify:', error);
    // Return more specific error for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { 
      success: false, 
      error: `Login failed: ${errorMessage}. Please check Netlify logs.`
    };
  }
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

// 🆕 FIXED: Get current user based on route context - IMPROVED PATH DETECTION
export async function getCurrentUser() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping getCurrentUser');
      return null;
    }

    // Try to get from headers or context to determine route
    const headersList = await headers();
    const pathname = headersList.get('x-invoke-path') || '';
    const referer = headersList.get('referer') || '';
    
    console.log('🔍 getCurrentUser - Detected path:', pathname);
    console.log('🔍 getCurrentUser - Referer:', referer);

    // 🆕 IMPROVED: Better route detection
    const isMentorRoute = pathname.includes('/mentors/') || referer.includes('/mentors/');
    const isStudentRoute = pathname.includes('/students/') || referer.includes('/students/');

    console.log('🔍 getCurrentUser - Route detection:', {
      isMentorRoute,
      isStudentRoute,
      pathname,
      referer
    });
    
    if (isMentorRoute) {
      console.log('🎯 getCurrentUser - Using mentor context');
      const mentor = await getCurrentMentor();
      if (mentor) return mentor;
      
      // If mentor route but no mentor session, try student as fallback
      console.log('🔄 getCurrentUser - No mentor session, trying student...');
      const student = await getCurrentStudent();
      return student;
    } 
    
    if (isStudentRoute) {
      console.log('🎯 getCurrentUser - Using student context');
      const student = await getCurrentStudent();
      if (student) return student;
      
      // If student route but no student session, try mentor as fallback
      console.log('🔄 getCurrentUser - No student session, trying mentor...');
      const mentor = await getCurrentMentor();
      return mentor;
    }

    // Fallback: try both with priority based on most recent activity
    console.log('🔍 getCurrentUser - Trying both sessions with priority...');
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

// 🚀 NETLIFY FIX: Updated student logout
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
      return await getCurrentStudent();
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

// 🆕 FIXED: Strict auth protection
export async function requireStudentAuth() {
  return buildSafeAsync(async () => {
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
  });
}

// 🚀 NEW: Check existing student auth (simple version)
export async function checkExistingStudentAuth() {
  try {
    // 🆕 Skip during static build
    if (isStaticBuild()) {
      console.log('🏗️ Build mode - skipping checkExistingStudentAuth');
      return { authenticated: false };
    }

    const cookieStore = await cookies();
    
    const studentDataCookie = cookieStore.get('student-session-v2')?.value;

    if (!studentDataCookie) {
      return { authenticated: false };
    }

    const userData = JSON.parse(studentDataCookie);
    
    if (userData.role !== 'student') {
      return { authenticated: false };
    }

    await connectDB();
    const student = await Student.findById(userData.id);
    
    if (!student) {
      return { authenticated: false };
    }

    return { 
      authenticated: true,
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: 'student'
      }
    };
  } catch (error) {
    return { authenticated: false };
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

// 🆕 Enhanced authentication check for any authenticated user
export async function requireAuth() {
  return buildSafeAsync(async () => {
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
  });
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