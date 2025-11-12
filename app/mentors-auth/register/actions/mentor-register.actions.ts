'use server';

import { connectDB } from '@/lib/db';
import { Mentor } from '@/models/Mentor';
import { revalidatePath } from 'next/cache';

export interface MentorRegistrationData {
  name: string;
  email: string;
  password: string;
}

export async function mentorRegister(formData: MentorRegistrationData) {
  try {
    await connectDB();

    const { name, email, password } = formData;

    console.log('🔑 Starting simple mentor registration for:', email);

    // Check if mentor already exists
    const existingMentor = await Mentor.findOne({ email });
    if (existingMentor) {
      return { error: 'Mentor already exists with this email' };
    }

    // Create mentor with basic info - CANNOT access dashboard yet
    const mentor = await Mentor.create({
      // Basic info from form
      name,
      email,
      password,
      
      // Allow login but NOT dashboard access
      canLogin: true,        // Can login to complete profile
      profileCompleted: false, // Profile not completed
      approvalStatus: 'pending', // Not approved by admin
      availability: false,   // Not available for sessions
      
      // Required fields with temporary values
      college: "Not specified yet - Please complete profile",
      experience: 0,
      qualification: "Not specified yet - Please complete profile", 
      bio: "Please complete your profile to start mentoring students.",
      
      // Empty arrays for profile completion
      expertise: [],
      skills: [],
      education: [],
      
      // Default values
      rating: 0,
      totalSessions: 0,
      submittedAt: new Date(),
      
      // Profiles
      profiles: {
        linkedin: "",
        github: "",
        portfolio: ""
      },
      
      // Stats
      stats: {
        responseTime: 24,
        satisfactionRate: 0,
        studentsHelped: 0
      },
      
      // Preferences
      preferences: {
        sessionTypes: [],
        maxSessionsPerWeek: 10,
        availableDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        timeSlots: ['09:00-11:00', '14:00-16:00', '18:00-20:00']
      }
    });

    console.log('✅ Mentor basic registration successful:', mentor._id);
    console.log('📊 Status - canLogin:', mentor.canLogin, 'profileCompleted:', mentor.profileCompleted, 'approvalStatus:', mentor.approvalStatus);
    
    revalidatePath('/admin/mentors');
    return { 
      success: true, 
      mentorId: mentor._id.toString(),
      message: 'Account created successfully! Please login to complete your profile.' 
    };
  } catch (error: any) {
    console.error('❌ Mentor registration error:', error);
    
    if (error.code === 11000) {
      return { error: 'Email already exists. Please use a different email.' };
    }
    
    return { error: 'Failed to create account. Please try again.' };
  }
}

// Mentor categories for the profile completion
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