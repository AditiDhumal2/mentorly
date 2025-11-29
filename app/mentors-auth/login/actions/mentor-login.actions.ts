'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { cookies } from 'next/headers';

export async function mentorLogin(email: string, password: string) {
  try {
    await connectDB();

    console.log('🔐 PRODUCTION: Attempting mentor login for:', email);

    // Find mentor by email and include password field
    const mentor = await Mentor.findOne({ email }).select('+password');
    
    if (!mentor) {
      console.log('❌ Mentor not found:', email);
      return { 
        success: false, 
        error: 'Invalid email or password' 
      };
    }

    // Check if mentor can login at all
    if (!mentor.canLogin) {
      console.log('🚫 Mentor login disabled:', email);
      return { 
        success: false, 
        error: 'Your account login is currently disabled. Please contact support.' 
      };
    }

    // Verify password
    const isPasswordValid = await mentor.comparePassword(password);
    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return { 
        success: false, 
        error: 'Invalid email or password' 
      };
    }

    console.log('✅ PRODUCTION: Mentor login successful:', email);
    console.log('📊 Mentor status:', {
      profileCompleted: mentor.profileCompleted,
      approvalStatus: mentor.approvalStatus,
      canLogin: mentor.canLogin
    });

    // 🆕 PRODUCTION FIX: Create session with proper cookie settings
    const cookieStore = await cookies();
    const sessionData = {
      mentorId: mentor._id.toString(),
      email: mentor.email,
      name: mentor.name,
      role: 'mentor',
      profileCompleted: mentor.profileCompleted,
      approvalStatus: mentor.approvalStatus,
      loggedInAt: new Date().toISOString()
    };

    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🍪 PRODUCTION: Setting cookie, production mode:', isProduction);

    // 🆕 CRITICAL FIX: Production cookie settings
    cookieStore.set('mentor-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    console.log('✅ PRODUCTION: Cookie set successfully');

    // 🎯 FLOW CONTROL: Return redirect URL instead of using redirect()
    let redirectTo = '/mentors/dashboard'; // Default redirect
    
    if (!mentor.profileCompleted) {
      console.log('📝 Redirecting to profile completion');
      redirectTo = '/mentors/complete-profile';
      return { 
        success: true, 
        redirectTo,
        message: 'Please complete your profile to continue.'
      };
    }

    if (mentor.approvalStatus !== 'approved') {
      console.log('⏳ Redirecting to pending approval');
      redirectTo = '/mentors/pending-approval';
      return { 
        success: true, 
        redirectTo,
        message: getLoginMessage(mentor.approvalStatus)
      };
    }

    // ✅ Only approved mentors with completed profiles go to dashboard
    console.log('🎯 PRODUCTION: Redirecting to dashboard - fully approved');
    
    return { 
      success: true, 
      redirectTo,
      message: 'Login successful! Redirecting to dashboard...'
    };

  } catch (error: any) {
    console.error('❌ PRODUCTION: Mentor login error:', error);
    
    return { 
      success: false, 
      error: 'Login failed. Please try again.' 
    };
  }
}

// 🆕 FIXED: Check if mentor is logged in - PRODUCTION OPTIMIZED
export async function checkMentorAuth() {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    if (isProduction) {
      console.log('🔍 PRODUCTION: Checking mentor session...');
    }
    
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mentor-session');
    
    if (isProduction) {
      console.log('🍪 PRODUCTION: Session cookie found:', !!sessionCookie);
      if (sessionCookie) {
        console.log('🔍 PRODUCTION: Cookie details:', {
          name: sessionCookie.name,
          valueLength: sessionCookie.value?.length,
          hasValue: !!sessionCookie.value
        });
      }
    }
    
    if (!sessionCookie?.value) {
      console.log('❌ PRODUCTION: No mentor session cookie found');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
      
      if (isProduction) {
        console.log('🔍 PRODUCTION: Parsed session data:', {
          mentorId: sessionData.mentorId,
          email: sessionData.email,
          role: sessionData.role
        });
      }
    } catch (parseError) {
      console.error('❌ PRODUCTION: Error parsing session cookie:', parseError);
      cookieStore.delete('mentor-session');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    // 🆕 Add timeout for production database calls
    const dbPromise = connectDB().then(async () => {
      const mentor = await Mentor.findById(sessionData.mentorId);
      return mentor;
    });

    let mentor;
    if (isProduction) {
      // Use timeout in production to prevent hanging
      mentor = await Promise.race([
        dbPromise,
        new Promise<null>((resolve) => 
          setTimeout(() => {
            console.log('⏰ PRODUCTION: Database timeout');
            resolve(null);
          }, 3000)
        )
      ]);
    } else {
      mentor = await dbPromise;
    }
    
    if (!mentor) {
      console.log('❌ PRODUCTION: Mentor not found in database for ID:', sessionData.mentorId);
      cookieStore.delete('mentor-session');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    if (!mentor.canLogin) {
      console.log('🚫 PRODUCTION: Mentor cannot login:', sessionData.email);
      cookieStore.delete('mentor-session');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    console.log('✅ PRODUCTION: Mentor session valid for:', mentor.email);
    
    return { 
      isAuthenticated: true,
      mentor: {
        id: mentor._id.toString(),
        _id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        profileCompleted: mentor.profileCompleted,
        approvalStatus: mentor.approvalStatus,
        role: 'mentor'
      }
    };
  } catch (error) {
    console.error('❌ PRODUCTION: Error checking mentor auth:', error);
    return { 
      isAuthenticated: false, 
      mentor: null 
    };
  }
}

// 🆕 FIXED: Logout function - PRODUCTION READY
export async function mentorLogout() {
  try {
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    console.log('🔒 PRODUCTION: Mentor logout initiated');
    
    // 🆕 Clear all mentor-related cookies
    const mentorCookies = ['mentor-session', 'mentor-data'];
    
    mentorCookies.forEach(cookieName => {
      const hadCookie = !!cookieStore.get(cookieName);
      cookieStore.delete(cookieName);
      console.log(`🗑️ PRODUCTION: Deleted mentor cookie: ${cookieName} - ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
    });
    
    console.log('✅ PRODUCTION: Mentor logout successful');
    
    return { 
      success: true, 
      message: 'Logged out successfully',
      redirectTo: '/mentors-auth/login?logout=success'
    };
    
  } catch (error) {
    console.error('❌ PRODUCTION: Error during logout:', error);
    return { 
      success: false, 
      error: 'Logout failed' 
    };
  }
}

// 🆕 FIXED: Quick session check without database call (for performance)
export async function hasActiveMentorSession() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mentor-session');
    
    if (!sessionCookie?.value) {
      return false;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Basic validation without database call
    return !!(sessionData.mentorId && sessionData.role === 'mentor');
    
  } catch (error) {
    console.error('❌ Error checking session:', error);
    return false;
  }
}

function getLoginMessage(status: string): string {
  switch (status) {
    case 'pending':
      return 'Your profile is complete! Waiting for admin approval. You will be notified via email.';
    case 'rejected':
      return 'Your application was rejected. Please contact support for details.';
    default:
      return 'Your account is under review. Please wait for approval.';
  }
}