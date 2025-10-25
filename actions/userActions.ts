// lib/actions/user-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getCurrentUser() {
  try {
    console.log('🔍 getCurrentUser - Starting to fetch current user...');
    
    const cookieStore = await cookies();
    
    // Get ALL cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log('🍪 getCurrentUser - All available cookies:', allCookies.map(c => c.name));
    
    // USE ONLY NEW COOKIE NAME - ignore all old cookies
    const studentCookie = cookieStore.get('student-session-v2');
    
    console.log('🔍 getCurrentUser - Student cookie found:', !!studentCookie);
    console.log('🔍 getCurrentUser - Using ONLY student-session-v2 cookie');

    if (!studentCookie) {
      console.log('❌ getCurrentUser - No student session cookie found');
      return null;
    }

    console.log('🔍 getCurrentUser - Cookie value length:', studentCookie.value?.length);
    
    if (!studentCookie.value || studentCookie.value.trim() === '') {
      console.log('❌ getCurrentUser - Cookie exists but value is empty or whitespace');
      return null;
    }

    let userData;
    try {
      userData = JSON.parse(studentCookie.value);
      console.log('🔍 getCurrentUser - Successfully parsed user data:', {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role
      });
    } catch (parseError) {
      console.error('❌ getCurrentUser - Error parsing cookie JSON:', parseError);
      console.log('🔍 getCurrentUser - Raw cookie value:', studentCookie.value);
      return null;
    }

    // Validate required fields
    if (!userData.id) {
      console.log('❌ getCurrentUser - No user ID found in cookie data');
      return null;
    }

    // STRICT validation - must be student role
    if (userData.role !== 'student') {
      console.log('❌ getCurrentUser - Invalid role for student access:', userData.role);
      return null;
    }

    console.log('🔍 getCurrentUser - Connecting to database...');
    await connectDB();
    
    console.log('🔍 getCurrentUser - Searching for student with ID:', userData.id);
    const user = await Student.findById(userData.id).select('-password').lean();
    
    if (!user) {
      console.log('❌ getCurrentUser - Student not found in database for ID:', userData.id);
      return null;
    }

    console.log('✅ getCurrentUser - Student found in database:', (user as any).name);
    
    const userDataFromDB = user as any;
    
    const formattedUser = {
      _id: userDataFromDB._id.toString(),
      name: userDataFromDB.name,
      email: userDataFromDB.email,
      role: userDataFromDB.role,
      year: userDataFromDB.year,
      college: userDataFromDB.college,
      profiles: userDataFromDB.profiles || {},
      interests: userDataFromDB.interests || [],
      createdAt: userDataFromDB.createdAt,
      updatedAt: userDataFromDB.updatedAt
    };

    console.log('✅ getCurrentUser - Successfully returning student:', formattedUser.name);
    
    return formattedUser;
  } catch (error) {
    console.error('❌ getCurrentUser - Unexpected error:', error);
    return null;
  }
}

// Student-specific session verification (NO REDIRECTS)
export async function verifyStudentSession() {
  try {
    const cookieStore = await cookies();
    
    // USE ONLY NEW COOKIE NAME
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
    const student = await Student.findById(studentData.id);
    
    if (!student) {
      return { isValid: false, error: 'Student account not found' };
    }

    return { 
      isValid: true, 
      student: {
        id: student._id.toString(),
        name: student.name,
        email: student.email,
        role: 'student',
        year: student.year,
        college: student.college,
        profiles: student.profiles || {},
        interests: student.interests || []
      }
    };
  } catch (error) {
    console.error('❌ verifyStudentSession - Error:', error);
    return { isValid: false, error: 'Student session verification failed' };
  }
}

// For student dashboard - NO REDIRECT, just return status
export async function checkStudentAuth() {
  const session = await verifyStudentSession();
  
  if (!session.isValid || !session.student) {
    console.log('🛑 checkStudentAuth - No valid student session');
    return { authenticated: false, student: null };
  }
  
  console.log('✅ checkStudentAuth - Student session valid for:', session.student.email);
  
  return {
    authenticated: true,
    student: session.student
  };
}

// Student-only logout - NO REDIRECTS
export async function studentLogout() {
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
  
  // Verify student cookies are cleared but admin cookies remain
  const studentDataAfter = cookieStore.get('student-data');
  const userDataAfter = cookieStore.get('user-data');
  const studentSessionV2After = cookieStore.get('student-session-v2');
  const adminDataAfter = cookieStore.get('admin-data');
  
  console.log('✅ studentLogout - Verification:', {
    studentDataAfter: studentDataAfter ? 'STILL_EXISTS' : 'DELETED',
    userDataAfter: userDataAfter ? 'STILL_EXISTS' : 'DELETED',
    studentSessionV2After: studentSessionV2After ? 'STILL_EXISTS' : 'DELETED',
    adminDataAfter: adminDataAfter ? 'STILL_EXISTS' : 'DELETED'
  });

  console.log('✅ studentLogout - All student cookies cleared, admin sessions preserved');
  
  return { 
    success: true, 
    message: 'Student logout successful',
    redirectUrl: '/students-auth/login?logout=success&t=' + Date.now()
  };
}

export async function getUserData(userId: string) {
  try {
    console.log('🔍 getUserData - Fetching data for user ID:', userId);
    
    await connectDB();
    
    const user = await Student.findById(userId).select('-password').lean();
    
    if (!user) {
      console.log('❌ getUserData - User not found for ID:', userId);
      throw new Error('User not found');
    }

    console.log('🔍 getUserData - Found user:', (user as any).name);

    // Simple type assertion to avoid TypeScript errors
    const userData = user as any;
    
    const formattedUser = {
      _id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      role: userData.role,
      year: userData.year,
      college: userData.college,
      profiles: userData.profiles || {},
      interests: userData.interests || [],
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt
    };

    console.log('✅ getUserData - Successfully formatted user data');
    return formattedUser;
  } catch (error) {
    console.error('❌ getUserData - Error:', error);
    throw new Error('Failed to fetch user data');
  }
}

export async function getUserProgress(userId: string) {
  try {
    console.log('🔍 getUserProgress - Fetching progress for user ID:', userId);
    
    await connectDB();
    
    const user = await Student.findById(userId).select('roadmapProgress brandingProgress savedResources year').lean();
    
    if (!user) {
      console.log('❌ getUserProgress - User not found for ID:', userId);
      throw new Error('User not found');
    }

    // Simple type assertion
    const userData = user as any;

    console.log('🔍 getUserProgress - Raw progress data:', {
      roadmapProgress: userData.roadmapProgress,
      brandingProgress: userData.brandingProgress,
      savedResources: userData.savedResources
    });

    // Simple progress calculation
    const completedRoadmapSteps = userData.roadmapProgress?.filter((p: any) => p.completed).length || 0;
    const completedBrandingTasks = userData.brandingProgress?.filter((p: any) => p.completed).length || 0;
    const savedResourcesCount = userData.savedResources?.length || 0;

    console.log('🔍 getUserProgress - Progress calculations:', {
      completedRoadmapSteps,
      completedBrandingTasks,
      savedResourcesCount
    });

    // Calculate percentages
    const roadmapProgress = Math.min(completedRoadmapSteps * 5, 100);
    const brandingProgress = Math.min(completedBrandingTasks * 10, 100);

    console.log('🔍 getUserProgress - Calculated percentages:', {
      roadmapProgress,
      brandingProgress
    });

    // Recent activity
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
    };

    console.log('✅ getUserProgress - Final progress data:', progressData);
    return progressData;
  } catch (error) {
    console.error('❌ getUserProgress - Error:', error);
    return {
      roadmapProgress: 0,
      brandingProgress: 0,
      savedResources: 0,
      recentActivity: [
        { type: 'welcome', title: 'Welcome to CareerCompanion', time: 'Just now' },
      ],
    };
  }
}

// Fixed authentication check without headers modification
export async function checkAuth() {
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
}

// STRICT Server-side protection for student pages
export async function requireStudentAuth() {
  console.log('🔐 requireStudentAuth - Starting strict authentication check');
  
  const user = await getCurrentUser();
  
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
}

// Enhanced authentication check for any authenticated user
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/students-auth/login?redirect=' + encodeURIComponent('/dashboard'));
  }
  
  return user;
}

// Check existing student auth for login page
export async function checkExistingStudentAuth() {
  try {
    const session = await verifyStudentSession();
    
    if (session.isValid) {
      console.log('✅ checkExistingStudentAuth - Student authenticated');
      return true;
    }
    
    console.log('✅ checkExistingStudentAuth - No student session');
    return false;
  } catch (error) {
    console.log('✅ checkExistingStudentAuth - Error, assuming no session');
    return false;
  }
}

// Get current student session data (for client-side use)
export async function getCurrentStudentSession() {
  try {
    const cookieStore = await cookies();
    
    // USE ONLY NEW COOKIE NAME
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
}

// Check if student session exists without validation (for middleware)
export async function hasStudentSession() {
  try {
    const cookieStore = await cookies();
    
    // USE ONLY NEW COOKIE NAME
    const studentDataCookie = cookieStore.get('student-session-v2')?.value;
    
    if (!studentDataCookie) {
      return false;
    }
    
    const studentData = JSON.parse(studentDataCookie);
    return studentData.role === 'student';
  } catch (error) {
    return false;
  }
}