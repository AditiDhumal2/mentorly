// actions/admin-mentor.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';

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
}

// Helper function to transform MongoDB document to MentorApplication
function transformMentorToApplication(mentor: any): MentorApplication {
  // Safely transform education array to remove MongoDB _id fields
  const safeEducation = (mentor.education || []).map((edu: any) => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    year: edu.year || new Date().getFullYear()
    // Explicitly exclude _id and any other MongoDB fields
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
    createdAt: mentor.createdAt || new Date()
  };
}

export async function getPendingMentors() {
  try {
    await connectDB();

    console.log('🔍 Fetching pending mentors from database...');

    // Use lean() and explicitly transform to plain objects
    const pendingMentors = await Mentor.find({
      approvalStatus: 'pending'
    })
    .sort({ submittedAt: 1 })
    .lean(); // lean() returns plain JavaScript objects

    console.log(`📊 Found ${pendingMentors.length} pending mentors`);

    // Transform to safe client-compatible objects
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

export async function approveMentor(mentorId: string, adminId: string) {
  try {
    await connectDB();

    const mentor = await Mentor.findOneAndUpdate(
      { 
        _id: mentorId,
        approvalStatus: 'pending'
      },
      {
        $set: {
          approvalStatus: 'approved',
          availability: true,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      },
      { new: true }
    );

    if (!mentor) {
      return { success: false, error: 'Mentor not found or already processed' };
    }

    revalidatePath('/admin/verifymentor');
    revalidatePath('/mentors');
    
    return { 
      success: true, 
      message: `Mentor ${mentor.name} approved successfully` 
    };
  } catch (error: any) {
    console.error('Error approving mentor:', error);
    return { success: false, error: 'Failed to approve mentor' };
  }
}

export async function rejectMentor(mentorId: string, adminId: string, reason: string) {
  try {
    await connectDB();

    const mentor = await Mentor.findOneAndUpdate(
      { 
        _id: mentorId,
        approvalStatus: 'pending'
      },
      {
        $set: {
          approvalStatus: 'rejected',
          rejectionReason: reason,
          availability: false,
          reviewedAt: new Date(),
          reviewedBy: adminId
        }
      },
      { new: true }
    );

    if (!mentor) {
      return { success: false, error: 'Mentor not found or already processed' };
    }

    revalidatePath('/admin/verifymentor');
    
    return { 
      success: true, 
      message: `Mentor ${mentor.name} rejected successfully` 
    };
  } catch (error: any) {
    console.error('Error rejecting mentor:', error);
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
      recent: recentApplications
    });

    return {
      success: true,
      stats: {
        total: totalMentors,
        approved: approvedMentors,
        pending: pendingMentors,
        rejected: rejectedMentors,
        recentApplications
      }
    };
  } catch (error: any) {
    console.error('Error fetching mentor stats:', error);
    return { success: false, error: 'Failed to fetch mentor stats' };
  }
}

// Debug function to check what's happening
export async function debugMentorData() {
  try {
    await connectDB();

    console.log('🐛 DEBUG: Checking mentor data...');

    // Check all mentors
    const allMentors = await Mentor.find({}).lean();
    console.log(`📊 Total mentors in database: ${allMentors.length}`);

    // Check by approval status
    const pendingCount = await Mentor.countDocuments({ approvalStatus: 'pending' });
    const approvedCount = await Mentor.countDocuments({ approvalStatus: 'approved' });
    const rejectedCount = await Mentor.countDocuments({ approvalStatus: 'rejected' });

    console.log('📋 Approval Status Breakdown:');
    console.log(`   - Pending: ${pendingCount}`);
    console.log(`   - Approved: ${approvedCount}`);
    console.log(`   - Rejected: ${rejectedCount}`);

    // Get detailed info about pending mentors
    const pendingMentors = await Mentor.find({ approvalStatus: 'pending' }).lean();
    
    console.log('📝 Pending Mentors Details:');
    if (pendingMentors.length === 0) {
      console.log('   No pending mentors found!');
    } else {
      pendingMentors.forEach((mentor: any, index: number) => {
        console.log(`   ${index + 1}. ${mentor.name} (${mentor.email})`);
        console.log(`      College: ${mentor.college}`);
        console.log(`      Status: ${mentor.approvalStatus}`);
        console.log(`      Submitted: ${mentor.submittedAt}`);
        console.log(`      Experience: ${mentor.experience} years`);
        console.log(`      Expertise: ${mentor.expertise?.length || 0} areas`);
      });
    }

    // Transform to safe objects for client
    const safePendingMentors = pendingMentors.map((m: any) => ({
      _id: m._id.toString(),
      name: m.name,
      email: m.email,
      approvalStatus: m.approvalStatus,
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
      pendingMentors: safePendingMentors
    };
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
}