// actions/mentor-dashboard-actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { MentorSession } from '@/models/MentorSession';
import { revalidatePath } from 'next/cache';
import { Types } from 'mongoose';

// Helper function to convert Mongoose documents to plain objects
function serializeDocument(doc: any): any {
  if (doc && typeof doc.toObject === 'function') {
    return doc.toObject();
  }
  if (Array.isArray(doc)) {
    return doc.map(serializeDocument);
  }
  if (doc && typeof doc === 'object') {
    const result: any = {};
    for (const key in doc) {
      if (doc.hasOwnProperty(key)) {
        result[key] = serializeDocument(doc[key]);
      }
    }
    return result;
  }
  return doc;
}

// Helper function to convert ObjectId to string
function convertObjectIdsToStrings(obj: any): any {
  if (obj && obj._id) {
    if (obj._id instanceof Types.ObjectId) {
      obj._id = obj._id.toString();
    }
    // Ensure id field exists and matches _id
    obj.id = obj._id.toString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(convertObjectIdsToStrings);
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = convertObjectIdsToStrings(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

// Helper to ensure all dates are serialized as strings
function serializeDates(obj: any): any {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }
  
  if (obj && typeof obj === 'object') {
    const result: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = serializeDates(obj[key]);
      }
    }
    return result;
  }
  
  return obj;
}

// Main serialization function that combines all steps
function fullySerializeData(data: any): any {
  const serialized = serializeDocument(data);
  const withStringIds = convertObjectIdsToStrings(serialized);
  const withSerializedDates = serializeDates(withStringIds);
  return withSerializedDates;
}

export async function getMentorDashboardData(mentorId: string) {
  try {
    await connectDB();

    // Get mentor with full details
    const mentor = await Mentor.findById(mentorId)
      .select('name email college expertise experience qualification bio rating totalSessions skills education profiles stats preferences availability profileCompleted approvalStatus profilePhoto memberSince');

    if (!mentor) {
      return { error: 'Mentor not found' };
    }

    // Get upcoming sessions
    const upcomingSessions = await MentorSession.find({
      mentor: mentorId,
      status: 'scheduled',
      date: { $gte: new Date() }
    })
    .populate('student', 'name email')
    .sort({ date: 1, startTime: 1 })
    .limit(5)
    .lean();

    // Get recent activities
    const recentSessions = await MentorSession.find({
      mentor: mentorId,
      status: { $in: ['completed', 'cancelled'] }
    })
    .populate('student', 'name email')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

    // Calculate dashboard stats
    const completedSessionsCount = await MentorSession.countDocuments({
      mentor: mentorId,
      status: 'completed'
    });

    const pendingRequestsCount = await MentorSession.countDocuments({
      mentor: mentorId,
      status: 'pending'
    });

    const upcomingSessionsCount = await MentorSession.countDocuments({
      mentor: mentorId,
      status: 'scheduled',
      date: { $gte: new Date() }
    });

    // Get unique students helped
    const uniqueStudents = await MentorSession.distinct('student', {
      mentor: mentorId,
      status: 'completed'
    });

    // Calculate earnings
    const sessionRate = 500;
    const totalEarnings = completedSessionsCount * sessionRate;

    // Format sessions for display with proper serialization
    const formattedUpcomingSessions = (upcomingSessions as any[]).map(session => {
      const serializedSession = fullySerializeData({
        id: session._id.toString(),
        _id: session._id.toString(),
        title: session.sessionType || 'Mentoring Session',
        student: {
          id: session.student._id.toString(),
          name: session.student.name,
          email: session.student.email
        },
        date: session.date.toISOString().split('T')[0],
        time: session.startTime,
        type: session.sessionType || 'general',
        status: session.status,
        duration: session.duration || 60,
        meetingLink: session.meetingLink
      });
      return serializedSession;
    });

    // Format recent activities with proper serialization
    const formattedActivities = (recentSessions as any[]).map(session => {
      const serializedActivity = fullySerializeData({
        id: session._id.toString(),
        _id: session._id.toString(),
        type: session.status === 'completed' ? 'session' : 'request',
        title: session.sessionType ? `${session.sessionType} Session` : 'Mentoring Session',
        student: session.student.name,
        time: session.createdAt.toISOString(),
        timestamp: session.createdAt,
        status: session.status,
        description: `Session with ${session.student.name}`
      });
      return serializedActivity;
    });

    // Add some additional activity types
    const additionalActivities: any[] = [];

    if (pendingRequestsCount > 0) {
      additionalActivities.push(fullySerializeData({
        id: 'pending-requests',
        _id: 'pending-requests',
        type: 'request',
        title: 'New Session Requests',
        student: `${pendingRequestsCount} students`,
        time: new Date().toISOString(),
        timestamp: new Date(),
        status: 'pending',
        description: `${pendingRequestsCount} pending session requests`
      }));
    }

    if (mentor.rating > 0) {
      additionalActivities.push(fullySerializeData({
        id: 'current-rating',
        _id: 'current-rating',
        type: 'review',
        title: 'Current Rating',
        student: 'Your students',
        time: new Date().toISOString(),
        timestamp: new Date(),
        status: 'positive',
        description: `Maintaining ${mentor.rating.toFixed(1)} star rating`
      }));
    }

    const allActivities = [...additionalActivities, ...formattedActivities].slice(0, 10);

    const stats = fullySerializeData({
      upcomingSessions: upcomingSessionsCount,
      completedSessions: completedSessionsCount,
      studentsHelped: uniqueStudents.length,
      rating: mentor.rating || 0,
      pendingRequests: pendingRequestsCount,
      totalEarnings: totalEarnings,
      responseTime: mentor.stats?.responseTime || 0,
      satisfactionRate: mentor.stats?.satisfactionRate || 0
    });

    // Convert mentor to plain object with full serialization
    const serializedMentor = fullySerializeData(mentor);

    return {
      success: true,
      mentor: serializedMentor,
      stats,
      upcomingSessions: formattedUpcomingSessions,
      recentActivities: allActivities
    };

  } catch (error: any) {
    console.error('Error fetching mentor dashboard data:', error);
    return { error: 'Failed to load dashboard data: ' + error.message };
  }
}

export async function getMentorSessions(mentorId: string, status?: string) {
  try {
    await connectDB();

    let query: any = { mentor: mentorId };
    if (status) {
      query.status = status;
    }

    const sessions = await MentorSession.find(query)
      .populate('student', 'name email')
      .sort({ date: 1, startTime: 1 })
      .lean();

    const formattedSessions = (sessions as any[]).map(session => {
      return fullySerializeData({
        id: session._id.toString(),
        _id: session._id.toString(),
        title: session.sessionType || 'Mentoring Session',
        student: {
          id: session.student._id.toString(),
          name: session.student.name,
          email: session.student.email
        },
        date: session.date.toISOString(),
        time: session.startTime,
        type: session.sessionType || 'general',
        status: session.status,
        duration: session.duration || 60,
        meetingLink: session.meetingLink,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      });
    });

    return { success: true, sessions: formattedSessions };
  } catch (error: any) {
    console.error('Error fetching mentor sessions:', error);
    return { error: 'Failed to fetch sessions' };
  }
}

export async function getMentorActivities(mentorId: string, limit = 10) {
  try {
    await connectDB();

    const sessions = await MentorSession.find({
      mentor: mentorId,
      status: { $in: ['completed', 'cancelled', 'scheduled'] }
    })
    .populate('student', 'name email')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .lean();

    const activities = (sessions as any[]).map(session => {
      return fullySerializeData({
        id: session._id.toString(),
        type: session.status === 'completed' ? 'session' : 
              session.status === 'scheduled' ? 'session' : 'request',
        title: session.sessionType ? `${session.sessionType} Session` : 'Mentoring Session',
        student: session.student.name,
        time: session.updatedAt.toISOString(),
        status: session.status,
        description: `Session with ${session.student.name}`
      });
    });

    return { success: true, activities };
  } catch (error: any) {
    console.error('Error fetching mentor activities:', error);
    return { error: 'Failed to fetch activities' };
  }
}

export async function updateMentorAvailability(mentorId: string, availability: boolean) {
  try {
    await connectDB();

    const mentor = await Mentor.findByIdAndUpdate(
      mentorId,
      { availability },
      { new: true }
    );

    if (!mentor) {
      return { error: 'Mentor not found' };
    }

    revalidatePath('/mentors/dashboard');
    revalidatePath('/mentors/profile');

    const serializedMentor = fullySerializeData(mentor);

    return { success: true, availability: serializedMentor.availability };
  } catch (error: any) {
    console.error('Error updating mentor availability:', error);
    return { error: 'Failed to update availability' };
  }
}

export async function updateMentorProfile(mentorId: string, updates: any) {
  try {
    await connectDB();

    const mentor = await Mentor.findByIdAndUpdate(
      mentorId,
      { 
        ...updates,
        profileCompleted: true
      },
      { new: true }
    );

    if (!mentor) {
      return { error: 'Mentor not found' };
    }

    revalidatePath('/mentors/dashboard');
    revalidatePath('/mentors/profile');

    const serializedMentor = fullySerializeData({
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
      college: mentor.college,
      expertise: mentor.expertise,
      experience: mentor.experience,
      qualification: mentor.qualification,
      bio: mentor.bio,
      skills: mentor.skills,
      education: mentor.education,
      profiles: mentor.profiles,
      preferences: mentor.preferences,
      profileCompleted: mentor.profileCompleted,
      approvalStatus: mentor.approvalStatus
    });

    return { 
      success: true, 
      mentor: serializedMentor
    };
  } catch (error: any) {
    console.error('Error updating mentor profile:', error);
    return { error: 'Failed to update profile: ' + error.message };
  }
}

export async function getMentorProfile(mentorId: string) {
  try {
    await connectDB();

    const mentor = await Mentor.findById(mentorId)
      .select('name email college expertise experience qualification bio rating totalSessions skills education profiles stats preferences availability profileCompleted approvalStatus profilePhoto memberSince');

    if (!mentor) {
      return { error: 'Mentor not found' };
    }

    const serializedMentor = fullySerializeData(mentor);

    return { success: true, mentor: serializedMentor };
  } catch (error: any) {
    console.error('Error fetching mentor profile:', error);
    return { error: 'Failed to fetch mentor profile' };
  }
}

export async function getMentorSessionStats(mentorId: string) {
  try {
    await connectDB();

    const totalSessions = await MentorSession.countDocuments({ mentor: mentorId });
    const completedSessions = await MentorSession.countDocuments({ 
      mentor: mentorId, 
      status: 'completed' 
    });
    const pendingSessions = await MentorSession.countDocuments({ 
      mentor: mentorId, 
      status: 'pending' 
    });
    const upcomingSessions = await MentorSession.countDocuments({ 
      mentor: mentorId, 
      status: 'scheduled',
      date: { $gte: new Date() }
    });

    const uniqueStudents = await MentorSession.distinct('student', {
      mentor: mentorId,
      status: 'completed'
    });

    const sessionRate = 500;
    const totalEarnings = completedSessions * sessionRate;

    const stats = fullySerializeData({
      totalSessions,
      completedSessions,
      pendingSessions,
      upcomingSessions,
      studentsHelped: uniqueStudents.length,
      totalEarnings
    });

    return { success: true, stats };
  } catch (error: any) {
    console.error('Error fetching mentor session stats:', error);
    return { error: 'Failed to fetch session stats' };
  }
}