// app/mentors/complete-profile/actions/complete-profile.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers'; // 🟢 CORRECT: Import from next/headers

export interface CompleteProfileData {
  college: string;
  expertise: string[];
  experience: number;
  qualification: string;
  bio: string;
  skills: string[];
  education: {
    degree: string;
    institution: string;
    year: number;
  }[];
  linkedin?: string;
  hourlyRate?: number;
}

export async function completeMentorProfile(profileData: CompleteProfileData) {
  try {
    await connectDB();
    console.log('🔄 Starting profile completion...');

    // Get mentor ID from session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('mentor-session');
    
    console.log('🔍 Session cookie exists:', !!sessionCookie?.value);
    
    if (!sessionCookie?.value) {
      console.log('❌ No session found');
      return { error: 'Not authenticated' };
    }

    const sessionData = JSON.parse(sessionCookie.value);
    const mentorId = sessionData.mentorId;

    console.log('👤 Mentor ID:', mentorId);
    console.log('📝 Profile data received:', {
      college: profileData.college,
      expertise: profileData.expertise?.length || 0,
      experience: profileData.experience,
      skills: profileData.skills?.length || 0,
      education: profileData.education?.length || 0
    });

    // Update mentor profile and mark as completed
    const updatedMentor = await Mentor.findByIdAndUpdate(
      mentorId,
      {
        ...profileData,
        profileCompleted: true, // ✅ Mark profile as completed
        approvalStatus: 'pending', // ✅ Set status to pending for admin approval
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!updatedMentor) {
      console.log('❌ Mentor not found with ID:', mentorId);
      return { error: 'Mentor not found' };
    }

    console.log('✅ Mentor profile updated successfully:', {
      profileCompleted: updatedMentor.profileCompleted,
      approvalStatus: updatedMentor.approvalStatus,
      name: updatedMentor.name
    });

    // 🆕 CRITICAL: UPDATE THE SESSION COOKIE with new status
    const updatedSessionData = {
      ...sessionData,
      profileCompleted: true,
      approvalStatus: 'pending'
    };

    console.log('🔄 Updating session cookie with:', updatedSessionData);

    // 🆕 Set the updated cookie
    cookieStore.set('mentor-session', JSON.stringify(updatedSessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    console.log('✅ Session cookie updated successfully');
    
    revalidatePath('/mentors/complete-profile');
    
    return { 
      success: true, 
      message: 'Profile completed successfully! Your application is now under admin review.',
      redirectTo: '/mentors/pending-approval'
    };
    
  } catch (error: any) {
    console.error('❌ Profile completion error:', error);
    return { 
      error: 'Failed to complete profile: ' + (error.message || 'Unknown error') 
    };
  }
}