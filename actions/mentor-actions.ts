'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { Types } from 'mongoose';

// Define proper TypeScript interfaces
interface MentorDocument {
  _id: Types.ObjectId;
  name: string;
  email: string;
  expertise: string[];
  experience: number;
  qualification: string;
  bio: string;
  availability: string;
  rating: number;
  totalSessions: number;
  skills: string[];
  education: Array<{
    degree: string;
    institution: string;
    year: number;
    _id?: Types.ObjectId;
  }>;
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

export async function getAllMentors() {
  try {
    await connectDB();
    const mentors = await Mentor.find({}).lean().exec();
    
    // Type assertion to handle the lean document structure
    const mentorsData = mentors as MentorDocument[];
    
    return mentorsData.map(mentor => ({
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
      expertise: mentor.expertise || [],
      experience: mentor.experience,
      qualification: mentor.qualification,
      bio: mentor.bio,
      availability: mentor.availability,
      rating: mentor.rating,
      totalSessions: mentor.totalSessions,
      skills: mentor.skills || [],
      education: (mentor.education || []).map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year
      })),
      profiles: mentor.profiles ? {
        linkedin: mentor.profiles.linkedin || '',
        github: mentor.profiles.github || '',
        portfolio: mentor.profiles.portfolio || ''
      } : {},
      stats: mentor.stats ? {
        responseTime: mentor.stats.responseTime || 0,
        satisfactionRate: mentor.stats.satisfactionRate || 0,
        studentsHelped: mentor.stats.studentsHelped || 0
      } : {
        responseTime: 0,
        satisfactionRate: 0,
        studentsHelped: 0
      }
    }));
  } catch (error) {
    console.error('Error fetching mentors:', error);
    throw new Error('Failed to fetch mentors');
  }
}

export async function getMentorById(mentorId: string) {
  try {
    await connectDB();
    const mentor = await Mentor.findById(mentorId).lean().exec();
    
    if (!mentor) {
      return null;
    }

    // Type assertion
    const mentorData = mentor as MentorDocument;
    
    return {
      id: mentorData._id.toString(),
      name: mentorData.name,
      email: mentorData.email,
      expertise: mentorData.expertise || [],
      experience: mentorData.experience,
      qualification: mentorData.qualification,
      bio: mentorData.bio,
      availability: mentorData.availability,
      rating: mentorData.rating,
      totalSessions: mentorData.totalSessions,
      skills: mentorData.skills || [],
      education: (mentorData.education || []).map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year
      })),
      profiles: mentorData.profiles ? {
        linkedin: mentorData.profiles.linkedin || '',
        github: mentorData.profiles.github || '',
        portfolio: mentorData.profiles.portfolio || ''
      } : {},
      stats: mentorData.stats ? {
        responseTime: mentorData.stats.responseTime || 0,
        satisfactionRate: mentorData.stats.satisfactionRate || 0,
        studentsHelped: mentorData.stats.studentsHelped || 0
      } : {
        responseTime: 0,
        satisfactionRate: 0,
        studentsHelped: 0
      }
    };
  } catch (error) {
    console.error('Error fetching mentor:', error);
    throw new Error('Failed to fetch mentor');
  }
}

export async function getCurrentMentorSession() {
  try {
    // This would typically get the current session from your auth system
    // For now, return a mock session or implement your actual auth logic
    return {
      isLoggedIn: false,
      mentor: null
    };
  } catch (error) {
    console.error('Error getting mentor session:', error);
    return {
      isLoggedIn: false,
      mentor: null
    };
  }
}

// Add the missing function for AskMentorModal
export async function getMentorsByExpertise(expertise: string) {
  try {
    await connectDB();
    const mentors = await Mentor.find({ 
      expertise: { $in: [expertise] } 
    }).lean().exec();
    
    const mentorsData = mentors as MentorDocument[];
    
    return mentorsData.map(mentor => ({
      id: mentor._id.toString(),
      name: mentor.name,
      email: mentor.email,
      expertise: mentor.expertise || [],
      experience: mentor.experience,
      qualification: mentor.qualification,
      bio: mentor.bio,
      availability: mentor.availability,
      rating: mentor.rating,
      totalSessions: mentor.totalSessions,
      skills: mentor.skills || [],
      education: (mentor.education || []).map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year
      })),
      profiles: mentor.profiles ? {
        linkedin: mentor.profiles.linkedin || '',
        github: mentor.profiles.github || '',
        portfolio: mentor.profiles.portfolio || ''
      } : {},
      stats: mentor.stats ? {
        responseTime: mentor.stats.responseTime || 0,
        satisfactionRate: mentor.stats.satisfactionRate || 0,
        studentsHelped: mentor.stats.studentsHelped || 0
      } : {
        responseTime: 0,
        satisfactionRate: 0,
        studentsHelped: 0
      }
    }));
  } catch (error) {
    console.error('Error fetching mentors by expertise:', error);
    throw new Error('Failed to fetch mentors by expertise');
  }
}