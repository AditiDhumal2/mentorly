// app/mentors-auth/register/actions/mentor-register.actions.ts
'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';

export interface MentorRegistrationData {
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
  hourlyRate?: number;
}

const mentorCategories = [
  'higher-education',
  'career-domains', 
  'market-trends',
  'roadmap-guidance',
  'placement-preparation',
  'technical-skills',
  'study-abroad',
  'resume-building',
  'interview-preparation',
  'project-guidance'
] as const;

export type MentorCategory = typeof mentorCategories[number];

export const getMentorCategories = async () => {
  return mentorCategories.map(category => ({
    value: category,
    label: category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '),
    description: getCategoryDescription(category)
  }));
};

const getCategoryDescription = (category: string): string => {
  const descriptions: Record<string, string> = {
    'higher-education': 'Guide students through Masters, PhD, GRE, TOEFL, and university applications',
    'career-domains': 'Help students choose and excel in specific career paths like ML, Web Dev, Data Science',
    'market-trends': 'Provide insights on current job market demands and emerging technologies',
    'roadmap-guidance': 'Create personalized learning paths for students based on their goals',
    'placement-preparation': 'Prepare students for campus placements, aptitude tests, and interviews',
    'technical-skills': 'Mentor students in specific programming languages and technologies',
    'study-abroad': 'Assist with international education opportunities and visa processes',
    'resume-building': 'Help students create professional resumes and LinkedIn profiles',
    'interview-preparation': 'Conduct mock interviews and provide feedback',
    'project-guidance': 'Guide students in building projects and portfolios'
  };
  return descriptions[category] || 'Guide students in this area';
};

export async function mentorRegister(formData: MentorRegistrationData) {
  try {
    await connectDB();

    const { 
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
      linkedin,
      hourlyRate 
    } = formData;

    console.log('🔑 Starting mentor registration for:', email);

    // Validate categories
    if (!expertise || expertise.length === 0) {
      return { error: 'Please select at least one mentoring category' };
    }

    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return { error: 'Mentor already exists with this email' };
    }

    // Create mentor with pending approval
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
      availability: false, // Not available until approved
      approvalStatus: 'pending',
      submittedAt: new Date(),
      profiles: {
        linkedin: linkedin || ''
      },
      hourlyRate: hourlyRate || 0,
      stats: {
        responseTime: 24,
        satisfactionRate: 0,
        studentsHelped: 0
      },
      preferences: {
        sessionTypes: expertise,
        maxSessionsPerWeek: 10,
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: ['09:00-11:00', '14:00-16:00', '18:00-20:00']
      }
    });

    console.log('✅ Mentor application submitted successfully:', mentor._id);
    
    revalidatePath('/admin/mentors');
    return { 
      success: true, 
      mentorId: mentor._id.toString(),
      message: 'Your mentor application has been submitted successfully! Our admin team will review your application and you will be notified via email once approved. This usually takes 24-48 hours.' 
    };
  } catch (error: any) {
    console.error('❌ Mentor registration error:', error);
    return { error: 'Failed to submit mentor application: ' + error.message };
  }
}