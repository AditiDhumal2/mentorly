// app/mentors-auth/login/actions/mentor-login.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { cookies } from 'next/headers';

export async function mentorLogin(email: string, password: string) {
  try {
    await connectDB();

    console.log('🔐 Attempting mentor login for:', email);

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

    console.log('✅ Mentor login successful:', email);
    console.log('📊 Mentor status:', {
      profileCompleted: mentor.profileCompleted,
      approvalStatus: mentor.approvalStatus,
      canLogin: mentor.canLogin
    });

    // Create session using cookies
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

    cookieStore.set('mentor-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    // 🎯 FLOW CONTROL: Redirect based on status
    if (!mentor.profileCompleted) {
      console.log('📝 Redirecting to profile completion');
      return { 
        success: true, 
        redirectTo: '/mentors/complete-profile',
        message: 'Please complete your profile to continue.'
      };
    }

    if (mentor.approvalStatus !== 'approved') {
      console.log('⏳ Redirecting to pending approval');
      return { 
        success: true, 
        redirectTo: '/mentors/pending-approval',
        message: getLoginMessage(mentor.approvalStatus)
      };
    }

    // ✅ Only approved mentors with completed profiles go to dashboard
    console.log('🎯 Redirecting to dashboard - fully approved');
    return { 
      success: true, 
      redirectTo: '/mentors/dashboard',
      message: 'Login successful!',
      mentor: {
        id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        role: 'mentor'
      }
    };

  } catch (error: any) {
    console.error('❌ Mentor login error:', error);
    return { 
      success: false, 
      error: 'Login failed. Please try again.' 
    };
  }
}

// 🆕 FIXED: Check if mentor is logged in - PROPER RETURN STRUCTURE
export async function checkMentorAuth() {
  try {
    console.log('🔍 checkMentorAuth - Checking mentor session...');
    
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mentor-session');
    
    console.log('🍪 Session cookie found:', !!sessionCookie);
    
    if (!sessionCookie?.value) {
      console.log('❌ No mentor session cookie found');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
      console.log('🔍 Parsed session data:', {
        mentorId: sessionData.mentorId,
        email: sessionData.email,
        role: sessionData.role
      });
    } catch (parseError) {
      console.error('❌ Error parsing session cookie:', parseError);
      cookieStore.delete('mentor-session');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    // Verify session is still valid with database
    await connectDB();
    const mentor = await Mentor.findById(sessionData.mentorId);
    
    if (!mentor) {
      console.log('❌ Mentor not found in database for ID:', sessionData.mentorId);
      cookieStore.delete('mentor-session');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    if (!mentor.canLogin) {
      console.log('🚫 Mentor cannot login:', sessionData.email);
      cookieStore.delete('mentor-session');
      return { 
        isAuthenticated: false, 
        mentor: null 
      };
    }

    console.log('✅ Mentor session valid for:', mentor.email);
    
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
    console.error('❌ Error checking mentor auth:', error);
    return { 
      isAuthenticated: false, 
      mentor: null 
    };
  }
}

// 🆕 FIXED: Logout function - SIMPLIFIED
export async function mentorLogout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('mentor-session');
    
    console.log('✅ Mentor logout successful');
    return { 
      success: true, 
      message: 'Logged out successfully',
      redirectTo: '/mentors-auth/login'
    };
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return { 
      success: false, 
      error: 'Logout failed' 
    };
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