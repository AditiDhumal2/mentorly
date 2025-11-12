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

// Check if mentor is logged in
export async function checkMentorAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mentor-session');
    
    if (!sessionCookie?.value) {
      return { isAuthenticated: false };
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Verify session is still valid
    await connectDB();
    const mentor = await Mentor.findById(sessionData.mentorId);
    
    if (!mentor || !mentor.canLogin) {
      // Clear invalid session
      cookieStore.delete('mentor-session');
      return { isAuthenticated: false };
    }

    return { 
      isAuthenticated: true,
      mentor: {
        id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        profileCompleted: mentor.profileCompleted,
        approvalStatus: mentor.approvalStatus
      }
    };
  } catch (error) {
    console.error('Error checking mentor auth:', error);
    return { isAuthenticated: false };
  }
}

// Logout function
export async function mentorLogout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('mentor-session');
    
    return { success: true, message: 'Logged out successfully' };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: 'Logout failed' };
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