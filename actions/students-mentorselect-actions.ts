'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { MentorSession } from '@/models/MentorSession';
import { Mentor as MentorType, MentorSessionRequest, MentorSearchParams, SessionRequest } from '@/types/mentor-selection';
import { Types } from 'mongoose';

// Helper function to convert MongoDB documents to plain objects
function convertToPlainObject(doc: any): any {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

// Define the lean mentor type based on your IMentor interface
interface LeanMentor {
  _id: Types.ObjectId;
  name: string;
  email: string;
  college?: string;
  expertise: string[];
  experience?: number;
  qualification?: string;
  bio?: string;
  availability: boolean;
  rating: number;
  totalSessions: number;
  hourlyRate?: number;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    _id?: Types.ObjectId;
  }>;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  profileCompleted: boolean;
  profiles: {
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  stats: {
    responseTime: number;
    satisfactionRate: number;
    studentsHelped: number;
  };
  __v?: number;
}

// Helper function to safely transform mentor documents
function transformMentor(mentor: LeanMentor): MentorType {
  // Convert education array to remove MongoDB objects
  const plainEducation = (mentor.education || []).map(edu => ({
    degree: edu.degree || '',
    institution: edu.institution || '',
    year: edu.year || 0
    // Remove _id field since it's not in your MentorType interface
  }));

  return {
    _id: mentor._id.toString(),
    name: mentor.name,
    email: mentor.email,
    college: mentor.college || '',
    expertise: mentor.expertise || [],
    experience: mentor.experience || 0,
    qualification: mentor.qualification || '',
    bio: mentor.bio || '',
    skills: mentor.skills || [],
    education: plainEducation, // Use the converted education array
    profiles: mentor.profiles || {},
    hourlyRate: mentor.hourlyRate || 0,
    approvalStatus: mentor.approvalStatus,
    profileCompleted: mentor.profileCompleted,
    availability: mentor.availability,
    rating: mentor.rating || 0,
    totalSessions: mentor.totalSessions || 0,
    studentsHelped: mentor.stats?.studentsHelped || 0,
    responseTime: mentor.stats?.responseTime || 24,
    satisfactionRate: mentor.stats?.satisfactionRate || 0
  };
}

export async function getApprovedMentors(searchParams: MentorSearchParams) {
  try {
    await connectDB();

    const { searchQuery, filters, page = 1, limit = 12 } = searchParams;
    const skip = (page - 1) * limit;

    console.log('🔍 Fetching approved mentors with filters:', { searchQuery, filters, page, limit });

    // Build filter query
    const filterQuery: any = {
      approvalStatus: 'approved',
      profileCompleted: true,
      availability: true
    };

    // Search query filter
    if (searchQuery) {
      filterQuery.$or = [
        { name: { $regex: searchQuery, $options: 'i' } },
        { college: { $regex: searchQuery, $options: 'i' } },
        { qualification: { $regex: searchQuery, $options: 'i' } },
        { expertise: { $in: [new RegExp(searchQuery, 'i')] } },
        { skills: { $in: [new RegExp(searchQuery, 'i')] } }
      ];
    }

    // Expertise filter
    if (filters.expertise && filters.expertise.length > 0) {
      filterQuery.expertise = { $in: filters.expertise };
    }

    // Experience filter
    if (filters.minExperience > 0 || filters.maxExperience > 0) {
      filterQuery.experience = {};
      if (filters.minExperience > 0) {
        filterQuery.experience.$gte = filters.minExperience;
      }
      if (filters.maxExperience > 0) {
        filterQuery.experience.$lte = filters.maxExperience;
      }
    }

    // Rating filter
    if (filters.minRating > 0) {
      filterQuery.rating = { $gte: filters.minRating };
    }

    console.log('📊 Filter query:', JSON.stringify(filterQuery, null, 2));

    // Get mentors with pagination - explicitly type the lean result
    const mentors = await Mentor.find(filterQuery)
      .sort({ rating: -1, experience: -1, 'stats.studentsHelped': -1 })
      .skip(skip)
      .limit(limit)
      .lean<LeanMentor[]>();

    // Get total count for pagination
    const totalMentors = await Mentor.countDocuments(filterQuery);

    // Transform mentors for client and convert to plain objects
    const transformedMentors: MentorType[] = mentors.map(mentor => 
      convertToPlainObject(transformMentor(mentor))
    );

    console.log(`✅ Found ${transformedMentors.length} mentors out of ${totalMentors} total`);

    return {
      success: true,
      mentors: transformedMentors,
      pagination: {
        page,
        limit,
        total: totalMentors,
        pages: Math.ceil(totalMentors / limit)
      }
    };

  } catch (error: any) {
    console.error('❌ Error fetching mentors:', error);
    return {
      success: false,
      error: 'Failed to fetch mentors',
      mentors: [],
      pagination: { page: 1, limit: 12, total: 0, pages: 0 }
    };
  }
}

export async function getMentorById(mentorId: string) {
  try {
    await connectDB();

    console.log('🔍 Fetching mentor by ID:', mentorId);

    const mentor = await Mentor.findById(mentorId).lean<LeanMentor>();

    if (!mentor) {
      return { success: false, error: 'Mentor not found' };
    }

    // Check if mentor is approved and available
    if (mentor.approvalStatus !== 'approved' || !mentor.availability) {
      return { success: false, error: 'Mentor is not available for sessions' };
    }

    const transformedMentor = convertToPlainObject(transformMentor(mentor));

    return { success: true, mentor: transformedMentor };

  } catch (error: any) {
    console.error('❌ Error fetching mentor:', error);
    return { success: false, error: 'Failed to fetch mentor' };
  }
}

export async function requestMentorSession(sessionData: Omit<MentorSessionRequest, 'status'>) {
  try {
    await connectDB();

    console.log('📨 Requesting mentor session:', sessionData);

    // Validate mentor exists and is available
    const mentor = await Mentor.findById(sessionData.mentorId);
    if (!mentor || mentor.approvalStatus !== 'approved' || !mentor.availability) {
      return { success: false, error: 'Mentor is not available for sessions' };
    }

    // Create session request
    const session = await MentorSession.create({
      ...sessionData,
      status: 'requested',
      requestedAt: new Date()
    });

    console.log('✅ Session request created:', session._id);

    return {
      success: true,
      message: 'Session request sent successfully! The mentor will review your request.',
      sessionId: session._id.toString()
    };

  } catch (error: any) {
    console.error('❌ Error requesting mentor session:', error);
    return { success: false, error: 'Failed to request session' };
  }
}

export async function getMentorExpertiseOptions() {
  try {
    await connectDB();

    // Get unique expertise options from all approved mentors
    const expertiseOptions = await Mentor.distinct('expertise', {
      approvalStatus: 'approved',
      profileCompleted: true
    });

    console.log('📚 Found expertise options:', expertiseOptions);

    return {
      success: true,
      expertise: expertiseOptions.filter(Boolean) // Remove empty strings
    };

  } catch (error: any) {
    console.error('❌ Error fetching expertise options:', error);
    return { success: false, error: 'Failed to fetch expertise options', expertise: [] };
  }
}

// Define the lean session type with populated mentor
interface LeanSession {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;
  mentorId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    college?: string;
    expertise: string[];
  };
  sessionType: string;
  title: string;
  description: string;
  status: string;
  proposedDates: Date[];
  scheduledDate?: Date;
  requestedAt: Date;
  createdAt: Date;
  __v?: number;
}

export async function getStudentSessionRequests(studentId: string) {
  try {
    await connectDB();

    console.log('🔍 Fetching session requests for student:', studentId);

    const sessions = await MentorSession.find({ studentId })
      .populate('mentorId', 'name email college expertise')
      .sort({ createdAt: -1 })
      .lean<LeanSession[]>();

    const transformedSessions = sessions.map(session => 
      convertToPlainObject({
        _id: session._id.toString(),
        mentor: {
          _id: session.mentorId._id.toString(),
          name: session.mentorId.name,
          email: session.mentorId.email,
          college: session.mentorId.college || '',
          expertise: session.mentorId.expertise || []
        },
        sessionType: session.sessionType,
        title: session.title,
        description: session.description,
        status: session.status,
        proposedDates: session.proposedDates,
        scheduledDate: session.scheduledDate,
        requestedAt: session.requestedAt,
        createdAt: session.createdAt
      })
    );

    return {
      success: true,
      sessions: transformedSessions
    };

  } catch (error: any) {
    console.error('❌ Error fetching student sessions:', error);
    return { success: false, error: 'Failed to fetch sessions', sessions: [] };
  }
}

// New function to get all expertise for filters
export async function getAllExpertiseOptions() {
  try {
    await connectDB();
    
    const expertiseOptions = await Mentor.distinct('expertise', {
      approvalStatus: 'approved',
      profileCompleted: true
    });
    
    return {
      success: true,
      expertise: expertiseOptions.filter(Boolean).sort()
    };
  } catch (error: any) {
    console.error('❌ Error fetching expertise options:', error);
    return { success: false, error: 'Failed to fetch expertise options', expertise: [] };
  }
}