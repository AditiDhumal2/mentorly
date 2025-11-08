// actions/mentor.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { MentorSession } from '@/models/MentorSession';
import { revalidatePath } from 'next/cache';

export async function mentorRegister(formData: {
  name: string;
  email: string;
  password: string;
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
  github?: string;
  portfolio?: string;
}) {
  try {
    await connectDB();

    const { 
      name, email, password, college, expertise, experience, 
      qualification, bio, skills, education, linkedin, github, portfolio 
    } = formData;

    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return { error: 'Mentor already exists with this email' };
    }

    // Create mentor
    const mentor = await Mentor.create({
      name,
      email,
      password,
      college,
      expertise,
      experience,
      qualification,
      bio,
      skills,
      education,
      profiles: {
        linkedin: linkedin || '',
        github: github || '',
        portfolio: portfolio || ''
      },
      // Default preferences
      preferences: {
        sessionTypes: ['higher-education', 'career-guidance', 'technical', 'placement-prep'],
        maxSessionsPerWeek: 10,
        availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        timeSlots: ['09:00-11:00', '14:00-16:00', '17:00-19:00']
      }
    });

    revalidatePath('/mentors');
    return { success: true, mentorId: mentor._id.toString() };
  } catch (error: any) {
    console.error('Mentor registration error:', error);
    return { error: 'Failed to create mentor account: ' + error.message };
  }
}

export async function mentorLogin(formData: { email: string; password: string }) {
  try {
    await connectDB();

    const { email, password } = formData;

    // Find mentor
    const mentor = await Mentor.findOne({ email });
    if (!mentor) {
      return { error: 'No mentor account found with this email' };
    }

    // Check password
    const isPasswordValid = await mentor.comparePassword(password);
    if (!isPasswordValid) {
      return { error: 'Invalid password' };
    }
    
    return { 
      success: true, 
      mentor: {
        id: mentor._id.toString(),
        name: mentor.name,
        email: mentor.email,
        role: mentor.role,
        college: mentor.college,
        expertise: mentor.expertise,
        experience: mentor.experience,
        rating: mentor.rating,
        availability: mentor.availability
      }
    };
  } catch (error: any) {
    console.error('Mentor login error:', error);
    return { error: 'Failed to login: ' + error.message };
  }
}

export async function getMentors(filters?: {
  expertise?: string;
  skills?: string[];
  minExperience?: number;
  maxSessions?: number;
}) {
  try {
    await connectDB();

    let query: any = { availability: true };

    if (filters?.expertise) {
      query.expertise = { $in: [filters.expertise] };
    }

    if (filters?.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }

    if (filters?.minExperience) {
      query.experience = { $gte: filters.minExperience };
    }

    const mentors = await Mentor.find(query)
      .select('name email college expertise experience qualification bio rating totalSessions skills education profiles stats')
      .sort({ rating: -1, experience: -1 });

    return { success: true, mentors };
  } catch (error: any) {
    console.error('Error fetching mentors:', error);
    return { error: 'Failed to fetch mentors' };
  }
}

export async function getMentorById(mentorId: string) {
  try {
    await connectDB();

    const mentor = await Mentor.findById(mentorId)
      .select('name email college expertise experience qualification bio rating totalSessions skills education profiles stats preferences');

    if (!mentor) {
      return { error: 'Mentor not found' };
    }

    return { success: true, mentor };
  } catch (error: any) {
    console.error('Error fetching mentor:', error);
    return { error: 'Failed to fetch mentor' };
  }
}

export async function getFeaturedMentors() {
  try {
    await connectDB();

    const mentors = await Mentor.find({ 
      availability: true,
      rating: { $gte: 4.0 },
      totalSessions: { $gte: 5 }
    })
    .select('name college expertise experience rating totalSessions skills profiles')
    .sort({ rating: -1, totalSessions: -1 })
    .limit(6);

    return { success: true, mentors };
  } catch (error: any) {
    console.error('Error fetching featured mentors:', error);
    return { error: 'Failed to fetch featured mentors' };
  }
}