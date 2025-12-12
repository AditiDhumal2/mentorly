// app/mentors-auth/login/actions/mentor-login.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { cookies } from 'next/headers';

export async function mentorLogin(email: string, password: string) {
  try {
    await connectDB();
    
    console.log('🔐 Mentor login for:', email);

    const mentor = await Mentor.findOne({ email }).select('+password');
    
    if (!mentor) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (!mentor.canLogin) {
      return { success: false, error: 'Your account login is currently disabled.' };
    }

    const isPasswordValid = await mentor.comparePassword(password);
    if (!isPasswordValid) {
      return { success: false, error: 'Invalid email or password' };
    }

    console.log('✅ Login successful:', email);

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
    
    console.log('🍪 Setting cookies, production mode:', isProduction);

    cookieStore.set('mentor-session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    cookieStore.set('mentor-logged-in', 'true', {
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    console.log('✅ Cookies set successfully');

    let redirectTo = '/mentors/dashboard';
    
    if (!mentor.profileCompleted) {
      console.log('📝 Redirecting to profile completion');
      redirectTo = '/mentors/complete-profile';
    } else if (mentor.approvalStatus !== 'approved') {
      console.log('⏳ Redirecting to pending approval');
      redirectTo = '/mentors/pending-approval';
    } else {
      console.log('🎯 Redirecting to dashboard - fully approved');
    }

    return { 
      success: true, 
      redirectTo,
      message: 'Login successful!'
    };

  } catch (error: any) {
    console.error('❌ Login error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// 🆕 FIXED: Convert Mongoose document to plain object
export async function checkMentorAuth() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mentor-session');
    
    if (!sessionCookie?.value) {
      return null;
    }

    let sessionData;
    try {
      sessionData = JSON.parse(sessionCookie.value);
    } catch {
      return null;
    }

    await connectDB();
    const mentorDoc = await Mentor.findById(sessionData.mentorId);
    
    if (!mentorDoc || !mentorDoc.canLogin) {
      return null;
    }

    // 🎯 CRITICAL FIX: Convert Mongoose document to plain object
    const mentor = mentorDoc.toObject ? mentorDoc.toObject() : { ...mentorDoc };
    
    return {
      id: mentor._id?.toString() || mentor.id,
      _id: mentor._id?.toString() || mentor.id,
      name: mentor.name,
      email: mentor.email,
      role: 'mentor',
      profileCompleted: mentor.profileCompleted,
      approvalStatus: mentor.approvalStatus,
      expertise: mentor.expertise || [],
      college: mentor.college || null,
      profilePhoto: mentor.profilePhoto || null,
      // 🆕 FIX: Convert nested Mongoose documents to plain objects
      profiles: mentor.profiles ? {
        linkedin: mentor.profiles.linkedin || '',
        github: mentor.profiles.github || '',
        portfolio: mentor.profiles.portfolio || ''
      } : { linkedin: '', github: '', portfolio: '' },
      experience: mentor.experience || null,
      bio: mentor.bio || '',
      // 🆕 FIX: Convert dates to strings
      createdAt: mentor.createdAt ? mentor.createdAt.toISOString() : new Date().toISOString(),
      updatedAt: mentor.updatedAt ? mentor.updatedAt.toISOString() : new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error checking mentor auth:', error);
    return null;
  }
}

// 🆕 Helper function to convert Mongoose docs to plain objects
function convertToPlainObject(doc: any): any {
  if (!doc) return null;
  
  // If it's already a plain object
  if (typeof doc !== 'object' || doc === null) return doc;
  
  // If it has toObject method, use it
  if (typeof doc.toObject === 'function') {
    return doc.toObject();
  }
  
  // Otherwise create a plain object
  const plainObj: any = {};
  
  for (const key in doc) {
    if (doc.hasOwnProperty(key)) {
      const value = doc[key];
      
      // Handle nested objects recursively
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          plainObj[key] = value.map(item => convertToPlainObject(item));
        } else if (value instanceof Date) {
          plainObj[key] = value.toISOString();
        } else if (typeof value.toObject === 'function') {
          plainObj[key] = value.toObject();
        } else {
          plainObj[key] = convertToPlainObject(value);
        }
      } else {
        plainObj[key] = value;
      }
    }
  }
  
  return plainObj;
}

// 🆕 SIMPLE & WORKING LOGOUT FUNCTION
export async function mentorLogout() {
  try {
    console.log('🔒 Starting logout process');
    
    const cookieStore = await cookies();
    
    // Delete cookies
    cookieStore.delete('mentor-session');
    cookieStore.delete('mentor-logged-in');
    
    console.log('✅ Logout successful - cookies cleared');
    
    // Return simple success
    return { success: true };
    
  } catch (error) {
    console.error('❌ Logout error:', error);
    return { success: false };
  }
}