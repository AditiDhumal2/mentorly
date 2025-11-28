// actions/mentor-auth-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { buildSafeAsync } from '@/lib/build-safe-auth';

// For mentor pages - only returns mentor users
export async function getCurrentMentorUser() {
  return buildSafeAsync(async () => {
    try {
      console.log('🔍 getCurrentMentorUser - Starting mentor-specific user fetch...');
      
      const cookieStore = await cookies();
      const mentorCookie = cookieStore.get('mentor-session');

      if (!mentorCookie?.value) {
        console.log('❌ getCurrentMentorUser - No mentor session found');
        return null;
      }

      console.log('🔍 getCurrentMentorUser - Found mentor cookie, parsing...');
      return await getMentorFromCookie(mentorCookie.value);
    } catch (error) {
      console.error('❌ getCurrentMentorUser - Error:', error);
      return null;
    }
  });
}

// Strict server-side protection for mentor pages
export async function requireMentorAuth() {
  return buildSafeAsync(async () => {
    console.log('🔐 requireMentorAuth - Starting strict authentication check');
    
    const user = await getCurrentMentorUser();
    
    if (!user) {
      console.log('❌ requireMentorAuth - No mentor user found, redirecting to login');
      redirect('/mentors-auth/login');
    }
    
    console.log('✅ requireMentorAuth - Mentor authenticated:', user.name);
    return user;
  });
}

// Check mentor authentication status
export async function checkMentorAuth() {
  return buildSafeAsync(async () => {
    try {
      const user = await getCurrentMentorUser();
      
      if (!user) {
        return { 
          isAuthenticated: false, 
          mentor: null,
          error: 'No mentor session found'
        };
      }

      return {
        isAuthenticated: true,
        mentor: user,
        error: null
      };
    } catch (error) {
      console.error('❌ checkMentorAuth - Error:', error);
      return {
        isAuthenticated: false,
        mentor: null,
        error: 'Authentication check failed'
      };
    }
  });
}

// Helper function to get mentor from cookie
async function getMentorFromCookie(cookieValue: string) {
  try {
    console.log('🔍 getMentorFromCookie - Parsing mentor cookie...');
    
    const mentorData = JSON.parse(cookieValue);
    console.log('🔍 getMentorFromCookie - Full parsed mentor data:', mentorData);

    // Support multiple possible ID fields
    let mentorId = mentorData.mentorId || mentorData.id || mentorData._id;
    
    if (!mentorId) {
      console.log('❌ getMentorFromCookie - No mentor ID found in cookie data');
      return null;
    }

    // Validate role
    if (mentorData.role !== 'mentor') {
      console.log('❌ getMentorFromCookie - Invalid role for mentor access:', mentorData.role);
      return null;
    }

    console.log('🔍 getMentorFromCookie - Using mentor ID:', mentorId);
    await connectDB();
    
    console.log('🔍 getMentorFromCookie - Searching for mentor with ID:', mentorId);
    const mentor = await Mentor.findById(mentorId).select('-password').lean();
    
    if (!mentor) {
      console.log('❌ getMentorFromCookie - Mentor not found in database');
      return null;
    }

    console.log('✅ getMentorFromCookie - Mentor found in database:', (mentor as any).name);
    
    const mentorDataFromDB = mentor as any;
    
    const formattedMentor = {
      _id: mentorDataFromDB._id.toString(),
      id: mentorDataFromDB._id.toString(),
      name: mentorDataFromDB.name,
      email: mentorDataFromDB.email,
      role: 'mentor',
      expertise: mentorDataFromDB.expertise || [],
      college: mentorDataFromDB.college,
      profiles: mentorDataFromDB.profiles || {},
      experience: mentorDataFromDB.experience,
      bio: mentorDataFromDB.bio,
      approvalStatus: mentorDataFromDB.approvalStatus || 'pending',
      profileCompleted: mentorDataFromDB.profileCompleted || false,
      rating: mentorDataFromDB.rating || 0,
      totalSessions: mentorDataFromDB.totalSessions || 0,
      stats: mentorDataFromDB.stats || {
        responseTime: 24,
        satisfactionRate: 0,
        studentsHelped: 0
      }
    };

    console.log('✅ getMentorFromCookie - Successfully returning mentor');
    return formattedMentor;
  } catch (error) {
    console.error('❌ getMentorFromCookie - Error:', error);
    return null;
  }
}