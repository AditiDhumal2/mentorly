// app/admin/verifymentor/actions/mentor-approval.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export interface MentorApplication {
  _id: string;
  name: string;
  email: string;
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
  profiles: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  hourlyRate?: number;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  submittedAt: Date;
  createdAt: Date;
  profileCompleted: boolean;
  canLogin: boolean;
}

// Helper function to transform MongoDB document to MentorApplication
function transformMentorToApplication(mentor: any): MentorApplication {
  // Safely transform education array to remove MongoDB _id fields
  const safeEducation = (mentor.education || []).map((edu: any) => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    year: edu.year || new Date().getFullYear()
  }));

  // Safely transform profiles
  const safeProfiles = {
    linkedin: mentor.profiles?.linkedin || undefined,
    github: mentor.profiles?.github || undefined,
    portfolio: mentor.profiles?.portfolio || undefined
  };

  return {
    _id: mentor._id?.toString() || '',
    name: mentor.name || '',
    email: mentor.email || '',
    college: mentor.college || '',
    expertise: mentor.expertise || [],
    experience: mentor.experience || 0,
    qualification: mentor.qualification || '',
    bio: mentor.bio || '',
    skills: mentor.skills || [],
    education: safeEducation,
    profiles: safeProfiles,
    hourlyRate: mentor.hourlyRate,
    approvalStatus: mentor.approvalStatus || 'pending',
    rejectionReason: mentor.rejectionReason,
    submittedAt: mentor.submittedAt || mentor.createdAt || new Date(),
    createdAt: mentor.createdAt || new Date(),
    profileCompleted: mentor.profileCompleted || false,
    canLogin: mentor.canLogin || false
  };
}

export async function getPendingMentors() {
  try {
    await connectDB();

    console.log('🔍 Fetching pending mentors from database...');

    const pendingMentors = await Mentor.find({
      approvalStatus: 'pending'
    })
    .sort({ submittedAt: 1 })
    .lean();

    console.log(`📊 Found ${pendingMentors.length} pending mentors`);

    // Enhanced logging for debugging
    if (pendingMentors.length > 0) {
      pendingMentors.forEach((mentor, index) => {
        console.log(`   ${index + 1}. ${mentor.name}`);
        console.log(`      - canLogin: ${mentor.canLogin}`);
        console.log(`      - profileCompleted: ${mentor.profileCompleted}`);
        console.log(`      - expertise: ${mentor.expertise?.length || 0} categories`);
        console.log(`      - skills: ${mentor.skills?.length || 0} skills`);
      });
    }

    const transformedMentors = pendingMentors.map(transformMentorToApplication);

    return { 
      success: true, 
      mentors: transformedMentors 
    };
  } catch (error: any) {
    console.error('❌ Error fetching pending mentors:', error);
    return { success: false, error: 'Failed to fetch pending mentors' };
  }
}

export async function getMentorById(mentorId: string) {
  try {
    await connectDB();

    const mentor = await Mentor.findById(mentorId).lean();

    if (!mentor) {
      return { success: false, error: 'Mentor not found' };
    }

    const transformedMentor = transformMentorToApplication(mentor);

    return { 
      success: true, 
      mentor: transformedMentor 
    };
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    return { success: false, error: 'Failed to fetch mentor' };
  }
}

export async function approveMentor(mentorId: string) {
  try {
    await connectDB();

    console.log('✅ Approving mentor:', mentorId);

    // First, check if mentor exists and get current data
    const existingMentor = await Mentor.findById(mentorId);
    if (!existingMentor) {
      return { success: false, error: 'Mentor not found' };
    }

    // Check if profile is completed
    if (!existingMentor.profileCompleted) {
      return { 
        success: false, 
        error: 'Cannot approve mentor with incomplete profile' 
      };
    }

    // Validate required fields are filled
    const requiredFields = ['college', 'qualification', 'bio', 'expertise'];
    const missingFields = requiredFields.filter(field => 
      !existingMentor[field as keyof typeof existingMentor] || 
      (Array.isArray(existingMentor[field as keyof typeof existingMentor]) && 
       (existingMentor[field as keyof typeof existingMentor] as any).length === 0)
    );

    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: `Cannot approve mentor. Missing required fields: ${missingFields.join(', ')}` 
      };
    }

    const mentor = await Mentor.findOneAndUpdate(
      { 
        _id: mentorId,
        approvalStatus: 'pending'
      },
      {
        $set: {
          approvalStatus: 'approved',
          canLogin: true, // ✅ Explicitly set
          availability: true,
          reviewedAt: new Date()
        }
      },
      { new: true }
    );

    if (!mentor) {
      console.log('❌ Mentor not found or already processed:', mentorId);
      return { success: false, error: 'Mentor not found or already processed' };
    }

    console.log('✅ Mentor approved successfully:', mentor.name);
    console.log('📊 Final Status - canLogin:', mentor.canLogin, 'approvalStatus:', mentor.approvalStatus);

    // 🆕 CRITICAL: UPDATE THE MENTOR'S SESSION COOKIE
    try {
      const cookieStore = await cookies();
      const currentMentorSession = cookieStore.get('mentor-session');
      
      console.log('🔍 Checking for mentor session cookie...');
      
      if (currentMentorSession?.value) {
        const sessionData = JSON.parse(currentMentorSession.value);
        console.log('👤 Current session mentor ID:', sessionData.mentorId);
        console.log('🎯 Target mentor ID:', mentorId);
        
        // If the approved mentor is the same as the logged-in user, update their session
        if (sessionData.mentorId === mentorId) {
          console.log('🔄 Updating session cookie for approved mentor');
          
          const updatedSessionData = {
            ...sessionData,
            approvalStatus: 'approved',
            profileCompleted: true
          };

          cookieStore.set('mentor-session', JSON.stringify(updatedSessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });

          console.log('✅ Session cookie updated for approved mentor');
          console.log('🆕 New session data:', updatedSessionData);
        } else {
          console.log('⚠️ Session mentor ID does not match approved mentor ID');
          console.log('Session mentor:', sessionData.mentorId);
          console.log('Approved mentor:', mentorId);
        }
      } else {
        console.log('⚠️ No mentor session cookie found - mentor might not be logged in');
      }
    } catch (cookieError) {
      console.log('❌ Error updating session cookie:', cookieError);
    }

    revalidatePath('/admin/verifymentor');
    revalidatePath('/mentors');
    
    return { 
      success: true, 
      message: `Mentor ${mentor.name} approved successfully. They can now login and access the dashboard.` 
    };
  } catch (error: any) {
    console.error('❌ Error approving mentor:', error);
    return { success: false, error: 'Failed to approve mentor' };
  }
}

export async function rejectMentor(mentorId: string, reason: string) {
  try {
    await connectDB();

    console.log('❌ Rejecting mentor:', mentorId, 'Reason:', reason);

    const mentor = await Mentor.findOneAndUpdate(
      { 
        _id: mentorId,
        approvalStatus: 'pending'
      },
      {
        $set: {
          approvalStatus: 'rejected',
          canLogin: false, // ✅ Explicitly set
          availability: false,
          rejectionReason: reason,
          reviewedAt: new Date()
        }
      },
      { new: true }
    );

    if (!mentor) {
      console.log('❌ Mentor not found or already processed:', mentorId);
      return { success: false, error: 'Mentor not found or already processed' };
    }

    console.log('✅ Mentor rejected successfully:', mentor.name);
    console.log('✅ canLogin set to:', mentor.canLogin);

    // 🆕 Update session cookie if this mentor is logged in
    try {
      const cookieStore = await cookies();
      const currentMentorSession = cookieStore.get('mentor-session');
      
      if (currentMentorSession?.value) {
        const sessionData = JSON.parse(currentMentorSession.value);
        
        if (sessionData.mentorId === mentorId) {
          console.log('🔄 Updating session cookie for rejected mentor');
          
          const updatedSessionData = {
            ...sessionData,
            approvalStatus: 'rejected'
          };

          cookieStore.set('mentor-session', JSON.stringify(updatedSessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });

          console.log('✅ Session cookie updated for rejected mentor');
        }
      }
    } catch (cookieError) {
      console.log('⚠️ Could not update session cookie for rejected mentor:', cookieError);
    }

    revalidatePath('/admin/verifymentor');
    
    return { 
      success: true, 
      message: `Mentor ${mentor.name} rejected successfully` 
    };
  } catch (error: any) {
    console.error('❌ Error rejecting mentor:', error);
    return { success: false, error: 'Failed to reject mentor' };
  }
}

export async function getMentorStats() {
  try {
    await connectDB();

    const totalMentors = await Mentor.countDocuments();
    const approvedMentors = await Mentor.countDocuments({ approvalStatus: 'approved' });
    const pendingMentors = await Mentor.countDocuments({ approvalStatus: 'pending' });
    const rejectedMentors = await Mentor.countDocuments({ approvalStatus: 'rejected' });

    // Count mentors who can login
    const canLoginMentors = await Mentor.countDocuments({ canLogin: true });

    // Count mentors with completed profiles
    const completedProfiles = await Mentor.countDocuments({ profileCompleted: true });

    // Get recent applications (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentApplications = await Mentor.countDocuments({
      submittedAt: { $gte: oneWeekAgo }
    });

    console.log('📈 Mentor Stats:', {
      total: totalMentors,
      pending: pendingMentors,
      approved: approvedMentors,
      rejected: rejectedMentors,
      canLogin: canLoginMentors,
      completedProfiles: completedProfiles,
      recent: recentApplications
    });

    return {
      success: true,
      stats: {
        total: totalMentors,
        approved: approvedMentors,
        pending: pendingMentors,
        rejected: rejectedMentors,
        canLogin: canLoginMentors,
        completedProfiles,
        recentApplications
      }
    };
  } catch (error: any) {
    console.error('Error fetching mentor stats:', error);
    return { success: false, error: 'Failed to fetch mentor stats' };
  }
}

// Bulk approve mentors for admin efficiency
export async function bulkApproveMentors(mentorIds: string[]) {
  try {
    await connectDB();

    console.log('✅ Bulk approving mentors:', mentorIds);

    // First, check if all mentors have completed profiles
    const mentorsToApprove = await Mentor.find({
      _id: { $in: mentorIds },
      approvalStatus: 'pending'
    });

    const incompleteMentors = mentorsToApprove.filter(mentor => !mentor.profileCompleted);
    if (incompleteMentors.length > 0) {
      return { 
        success: false, 
        error: `Cannot approve ${incompleteMentors.length} mentors with incomplete profiles` 
      };
    }

    const result = await Mentor.updateMany(
      { 
        _id: { $in: mentorIds },
        approvalStatus: 'pending'
      },
      {
        $set: {
          approvalStatus: 'approved',
          canLogin: true,
          availability: true,
          reviewedAt: new Date()
        }
      }
    );

    console.log(`✅ Bulk approved ${result.modifiedCount} mentors`);

    // 🆕 Update session cookies for any logged-in mentors
    try {
      const cookieStore = await cookies();
      const currentMentorSession = cookieStore.get('mentor-session');
      
      if (currentMentorSession?.value) {
        const sessionData = JSON.parse(currentMentorSession.value);
        
        if (mentorIds.includes(sessionData.mentorId)) {
          console.log('🔄 Updating session cookie for bulk approved mentor');
          
          const updatedSessionData = {
            ...sessionData,
            approvalStatus: 'approved',
            profileCompleted: true
          };

          cookieStore.set('mentor-session', JSON.stringify(updatedSessionData), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7,
            path: '/',
          });

          console.log('✅ Session cookie updated for bulk approved mentor');
        }
      }
    } catch (cookieError) {
      console.log('⚠️ Could not update session cookie for bulk approval:', cookieError);
    }

    revalidatePath('/admin/verifymentor');
    revalidatePath('/mentors');
    
    return { 
      success: true, 
      message: `Successfully approved ${result.modifiedCount} mentors` 
    };
  } catch (error: any) {
    console.error('❌ Error bulk approving mentors:', error);
    return { success: false, error: 'Failed to bulk approve mentors' };
  }
}

// Debug function to check mentor data
export async function debugMentorData() {
  try {
    await connectDB();

    console.log('🐛 DEBUG: Checking mentor data...');

    // Check all mentors
    const allMentors = await Mentor.find({}).lean();
    console.log(`📊 Total mentors in database: ${allMentors.length}`);

    // Check by approval status and canLogin
    const pendingCount = await Mentor.countDocuments({ approvalStatus: 'pending' });
    const approvedCount = await Mentor.countDocuments({ approvalStatus: 'approved' });
    const rejectedCount = await Mentor.countDocuments({ approvalStatus: 'rejected' });
    const canLoginCount = await Mentor.countDocuments({ canLogin: true });
    const completedProfilesCount = await Mentor.countDocuments({ profileCompleted: true });

    console.log('📋 Approval Status Breakdown:');
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Rejected: ${rejectedCount}`);
    console.log(`   - Can Login: ${canLoginCount}`);
    console.log(`   - Completed Profiles: ${completedProfilesCount}`);

    // Get detailed info about all mentors
    const allMentorsDetails = await Mentor.find({}).lean();
    
    console.log('📝 All Mentors Details:');
    if (allMentorsDetails.length === 0) {
      console.log('   No mentors found!');
    } else {
      allMentorsDetails.forEach((mentor: any, index: number) => {
        console.log(`   ${index + 1}. ${mentor.name} (${mentor.email})`);
        console.log(`      Status: ${mentor.approvalStatus}`);
        console.log(`      Can Login: ${mentor.canLogin}`);
        console.log(`      Profile Completed: ${mentor.profileCompleted}`);
        console.log(`      Availability: ${mentor.availability}`);
        console.log(`      Submitted: ${mentor.submittedAt}`);
      });
    }

    // Transform to safe objects for client
    const safeMentors = allMentorsDetails.map((m: any) => ({
      _id: m._id.toString(),
      name: m.name,
      email: m.email,
      approvalStatus: m.approvalStatus,
      canLogin: m.canLogin,
      profileCompleted: m.profileCompleted,
      availability: m.availability,
      college: m.college,
      expertise: m.expertise,
      experience: m.experience
    }));

    return {
      success: true,
      total: allMentors.length,
      pending: pendingCount,
      approved: approvedCount,
      rejected: rejectedCount,
      canLogin: canLoginCount,
      completedProfiles: completedProfilesCount,
      mentors: safeMentors
    };
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}

// Function to manually fix canLogin status if needed
export async function fixMentorLoginStatus(mentorId: string) {
  try {
    await connectDB();

    const mentor = await Mentor.findById(mentorId);
    if (!mentor) {
      return { success: false, error: 'Mentor not found' };
    }

    // Fix the canLogin status based on approvalStatus
    const shouldCanLogin = mentor.approvalStatus === 'approved';
    
    if (mentor.canLogin !== shouldCanLogin) {
      mentor.canLogin = shouldCanLogin;
      await mentor.save();
      
      console.log(`✅ Fixed login status for ${mentor.name}: canLogin = ${shouldCanLogin}`);
      return { 
        success: true, 
        message: `Fixed login status for ${mentor.name}` 
      };
    }

    return { 
      success: true, 
      message: 'No fix needed - login status is correct' 
    };
  } catch (error: any) {
    console.error('Error fixing mentor login status:', error);
    return { success: false, error: 'Failed to fix login status' };
  }
}