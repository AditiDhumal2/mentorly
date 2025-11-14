'use server';

import { connectDB } from '@/lib/db';
import { MentorSession } from '@/models/MentorSession';
import { Mentor } from '@/models/Mentor';
import { Student } from '@/models/Students';
import { MentorSession as MentorSessionType, SessionActionRequest } from '@/types/mentor-sessions';
import { Types } from 'mongoose';

// Helper function to convert MongoDB documents to plain objects
function convertToPlainObject(doc: any): any {
  if (!doc) return null;
  return JSON.parse(JSON.stringify(doc));
}

// Define lean session type with proper typing
interface LeanSession {
  _id: Types.ObjectId;
  studentId: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    year: string;
    college?: string;
    interests?: string[];
  };
  mentorId: Types.ObjectId;
  sessionType: 'higher-education' | 'career-guidance' | 'technical' | 'placement-prep' | 'study-abroad';
  title: string;
  description: string;
  status: 'requested' | 'accepted' | 'scheduled' | 'completed' | 'cancelled' | 'rejected';
  proposedDates: Date[];
  scheduledDate?: Date;
  duration: number;
  meetingLink?: string;
  studentQuestions: string[];
  mentorNotes?: string;
  preSessionMaterials?: string[];
  mentorPlan?: {
    title: string;
    description: string;
    steps: {
      title: string;
      description: string;
      resources: { title: string; url: string }[];
      deadline?: Date;
      completed: boolean;
      completedAt?: Date;
    }[];
  };
  studentFeedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  mentorFeedback?: {
    rating: number;
    comment: string;
    createdAt: Date;
  };
  requestedAt: Date;
  acceptedAt?: Date;
  scheduledAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  rejectedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  __v?: number;
}

// Map action types to status types
function mapActionToStatus(action: SessionActionRequest['action']): MentorSessionType['status'] {
  const actionMap: Record<SessionActionRequest['action'], MentorSessionType['status']> = {
    'accept': 'accepted',
    'reject': 'rejected', 
    'schedule': 'scheduled',
    'complete': 'completed',
    'cancel': 'cancelled'
  };
  return actionMap[action];
}

export async function getMentorSessions(mentorId: string) {
  try {
    await connectDB();

    console.log('🔍 Fetching sessions for mentor:', mentorId);

    const sessions = await MentorSession.find({ mentorId })
      .populate('studentId', 'name email year college interests')
      .sort({ createdAt: -1 })
      .lean<LeanSession[]>();

    const transformedSessions: MentorSessionType[] = sessions.map((session: LeanSession) => 
      convertToPlainObject({
        _id: session._id.toString(),
        studentId: {
          _id: session.studentId._id.toString(),
          name: session.studentId.name,
          email: session.studentId.email,
          year: session.studentId.year,
          college: session.studentId.college || '',
          interests: session.studentId.interests || []
        },
        mentorId: session.mentorId.toString(),
        sessionType: session.sessionType,
        title: session.title,
        description: session.description,
        status: session.status,
        proposedDates: session.proposedDates.map((date: Date) => date.toISOString()),
        scheduledDate: session.scheduledDate?.toISOString(),
        duration: session.duration,
        meetingLink: session.meetingLink,
        studentQuestions: session.studentQuestions || [],
        mentorNotes: session.mentorNotes,
        preSessionMaterials: session.preSessionMaterials || [],
        mentorPlan: session.mentorPlan ? convertToPlainObject(session.mentorPlan) : undefined,
        studentFeedback: session.studentFeedback ? convertToPlainObject(session.studentFeedback) : undefined,
        mentorFeedback: session.mentorFeedback ? convertToPlainObject(session.mentorFeedback) : undefined,
        requestedAt: session.requestedAt.toISOString(),
        acceptedAt: session.acceptedAt?.toISOString(),
        scheduledAt: session.scheduledAt?.toISOString(),
        completedAt: session.completedAt?.toISOString(),
        cancelledAt: session.cancelledAt?.toISOString(),
        rejectedAt: session.rejectedAt?.toISOString(),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString()
      })
    );

    console.log(`✅ Found ${transformedSessions.length} sessions for mentor`);

    return {
      success: true,
      sessions: transformedSessions
    };

  } catch (error: any) {
    console.error('❌ Error fetching mentor sessions:', error);
    return { success: false, error: 'Failed to fetch sessions', sessions: [] };
  }
}

export async function updateSessionStatus(actionData: SessionActionRequest) {
  try {
    await connectDB();

    console.log('🔄 Updating session status:', actionData);

    const { sessionId, action, scheduledDate, meetingLink, mentorNotes, mentorPlan } = actionData;

    const session = await MentorSession.findById(sessionId);
    if (!session) {
      return { success: false, error: 'Session not found' };
    }

    const newStatus = mapActionToStatus(action);
    const updateData: any = { status: newStatus };
    const timestampFields: any = {};

    switch (action) {
      case 'accept':
        timestampFields.acceptedAt = new Date();
        if (mentorNotes) updateData.mentorNotes = mentorNotes;
        if (mentorPlan) updateData.mentorPlan = mentorPlan;
        
        // Update mentor stats when session is accepted
        await Mentor.findByIdAndUpdate(session.mentorId, {
          $inc: { 
            'stats.sessionsAccepted': 1
          }
        });
        break;
      case 'schedule':
        timestampFields.scheduledAt = new Date();
        if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
        if (meetingLink) updateData.meetingLink = meetingLink;
        if (mentorNotes) updateData.mentorNotes = mentorNotes;
        break;
      case 'complete':
        timestampFields.completedAt = new Date();
        
        // Update mentor stats when session is completed
        await Mentor.findByIdAndUpdate(session.mentorId, {
          $inc: { 
            totalSessions: 1,
            'stats.studentsHelped': 1,
            'stats.sessionsCompleted': 1
          }
        });
        break;
      case 'reject':
        timestampFields.rejectedAt = new Date();
        if (mentorNotes) updateData.mentorNotes = mentorNotes;
        break;
      case 'cancel':
        timestampFields.cancelledAt = new Date();
        if (mentorNotes) updateData.mentorNotes = mentorNotes;
        break;
    }

    // Update session with status and timestamps
    const updatedSession = await MentorSession.findByIdAndUpdate(
      sessionId,
      { ...updateData, ...timestampFields },
      { new: true, runValidators: true }
    ).populate('studentId', 'name email year college interests');

    if (!updatedSession) {
      return { success: false, error: 'Failed to update session' };
    }

    console.log(`✅ Session ${sessionId} updated to status: ${newStatus}`);

    // Convert the updated session to plain object with proper transformation
    const plainSession = convertToPlainObject(updatedSession);
    const transformedSession: MentorSessionType = {
      _id: plainSession._id.toString(),
      studentId: {
        _id: plainSession.studentId._id.toString(),
        name: plainSession.studentId.name,
        email: plainSession.studentId.email,
        year: plainSession.studentId.year,
        college: plainSession.studentId.college || '',
        interests: plainSession.studentId.interests || []
      },
      mentorId: plainSession.mentorId.toString(),
      sessionType: plainSession.sessionType,
      title: plainSession.title,
      description: plainSession.description,
      status: plainSession.status,
      proposedDates: plainSession.proposedDates.map((date: any) => 
        typeof date === 'string' ? date : new Date(date).toISOString()
      ),
      scheduledDate: plainSession.scheduledDate ? 
        (typeof plainSession.scheduledDate === 'string' ? 
          plainSession.scheduledDate : 
          new Date(plainSession.scheduledDate).toISOString()) : 
        undefined,
      duration: plainSession.duration,
      meetingLink: plainSession.meetingLink,
      studentQuestions: plainSession.studentQuestions || [],
      mentorNotes: plainSession.mentorNotes,
      preSessionMaterials: plainSession.preSessionMaterials || [],
      mentorPlan: plainSession.mentorPlan,
      studentFeedback: plainSession.studentFeedback,
      mentorFeedback: plainSession.mentorFeedback,
      requestedAt: new Date(plainSession.requestedAt).toISOString(),
      acceptedAt: plainSession.acceptedAt ? new Date(plainSession.acceptedAt).toISOString() : undefined,
      scheduledAt: plainSession.scheduledAt ? new Date(plainSession.scheduledAt).toISOString() : undefined,
      completedAt: plainSession.completedAt ? new Date(plainSession.completedAt).toISOString() : undefined,
      cancelledAt: plainSession.cancelledAt ? new Date(plainSession.cancelledAt).toISOString() : undefined,
      rejectedAt: plainSession.rejectedAt ? new Date(plainSession.rejectedAt).toISOString() : undefined,
      createdAt: new Date(plainSession.createdAt).toISOString(),
      updatedAt: new Date(plainSession.updatedAt).toISOString()
    };

    return {
      success: true,
      message: `Session ${action}ed successfully`,
      session: transformedSession
    };

  } catch (error: any) {
    console.error('❌ Error updating session status:', error);
    return { success: false, error: 'Failed to update session: ' + error.message };
  }
}

export async function getMentorStats(mentorId: string) {
  try {
    await connectDB();

    const [
      totalSessions,
      pendingRequests,
      completedSessions,
      upcomingSessions,
      acceptedSessions
    ] = await Promise.all([
      MentorSession.countDocuments({ mentorId }),
      MentorSession.countDocuments({ mentorId, status: 'requested' }),
      MentorSession.countDocuments({ mentorId, status: 'completed' }),
      MentorSession.countDocuments({ 
        mentorId, 
        status: 'scheduled',
        scheduledDate: { $gte: new Date() }
      }),
      MentorSession.countDocuments({ 
        mentorId, 
        status: 'accepted'
      })
    ]);

    return {
      success: true,
      stats: {
        totalSessions,
        pendingRequests,
        completedSessions,
        upcomingSessions,
        acceptedSessions
      }
    };

  } catch (error: any) {
    console.error('❌ Error fetching mentor stats:', error);
    return { success: false, error: 'Failed to fetch stats', stats: null };
  }
}

export async function getMentorDashboardStats(mentorId: string) {
  try {
    await connectDB();

    const [
      totalSessions,
      pendingRequests,
      completedSessions,
      upcomingSessions,
      acceptedSessions,
      mentor
    ] = await Promise.all([
      MentorSession.countDocuments({ mentorId }),
      MentorSession.countDocuments({ mentorId, status: 'requested' }),
      MentorSession.countDocuments({ mentorId, status: 'completed' }),
      MentorSession.countDocuments({ 
        mentorId, 
        status: 'scheduled',
        scheduledDate: { $gte: new Date() }
      }),
      MentorSession.countDocuments({ 
        mentorId, 
        status: 'accepted'
      }),
      Mentor.findById(mentorId).select('rating totalSessions stats')
    ]);

    return {
      success: true,
      stats: {
        totalSessions,
        pendingRequests,
        completedSessions,
        upcomingSessions,
        acceptedSessions,
        rating: mentor?.rating || 0,
        studentsHelped: mentor?.stats?.studentsHelped || 0,
        sessionsAccepted: mentor?.stats?.sessionsAccepted || 0,
        sessionsCompleted: mentor?.stats?.sessionsCompleted || 0
      }
    };

  } catch (error: any) {
    console.error('❌ Error fetching mentor dashboard stats:', error);
    return { 
      success: false, 
      error: 'Failed to fetch dashboard stats', 
      stats: null 
    };
  }
}

// Additional function to get student sessions
export async function getStudentSessions(studentId: string) {
  try {
    await connectDB();

    console.log('🔍 Fetching sessions for student:', studentId);

    const sessions = await MentorSession.find({ studentId })
      .populate('mentorId', 'name email expertise rating')
      .sort({ createdAt: -1 })
      .lean();

    const transformedSessions = sessions.map((session: any) => 
      convertToPlainObject({
        _id: session._id.toString(),
        mentorId: {
          _id: session.mentorId._id.toString(),
          name: session.mentorId.name,
          email: session.mentorId.email,
          expertise: session.mentorId.expertise || [],
          rating: session.mentorId.rating || 0
        },
        sessionType: session.sessionType,
        title: session.title,
        description: session.description,
        status: session.status,
        proposedDates: session.proposedDates.map((date: any) => new Date(date).toISOString()),
        scheduledDate: session.scheduledDate ? new Date(session.scheduledDate).toISOString() : undefined,
        duration: session.duration,
        meetingLink: session.meetingLink,
        studentQuestions: session.studentQuestions || [],
        mentorNotes: session.mentorNotes,
        preSessionMaterials: session.preSessionMaterials || [],
        mentorPlan: session.mentorPlan,
        studentFeedback: session.studentFeedback,
        mentorFeedback: session.mentorFeedback,
        requestedAt: session.requestedAt.toISOString(),
        acceptedAt: session.acceptedAt?.toISOString(),
        scheduledAt: session.scheduledAt?.toISOString(),
        completedAt: session.completedAt?.toISOString(),
        cancelledAt: session.cancelledAt?.toISOString(),
        rejectedAt: session.rejectedAt?.toISOString(),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString()
      })
    );

    console.log(`✅ Found ${transformedSessions.length} sessions for student`);

    return {
      success: true,
      sessions: transformedSessions
    };

  } catch (error: any) {
    console.error('❌ Error fetching student sessions:', error);
    return { success: false, error: 'Failed to fetch sessions', sessions: [] };
  }
}