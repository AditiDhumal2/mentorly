'use server';

import { redirect } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';

export async function registerUser(formData: FormData) {
  try {
    await connectDB();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string; // Keep as PLAIN TEXT
    const year = formData.get('year') as string;
    const college = formData.get('college') as string;

    console.log('🔍 registerUser - Starting registration for:', email);
    console.log('🔑 Plain password received:', password ? '***' : 'undefined');
    console.log('🔑 Password length:', password?.length);

    // Validate required fields
    if (!name || !email || !password || !year || !college) {
      console.log('❌ registerUser - Missing required fields');
      return { error: 'All fields are required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ registerUser - Invalid email format:', email);
      return { error: 'Please enter a valid email address' };
    }

    // Validate password length
    if (password.length < 6) {
      console.log('❌ registerUser - Password too short');
      return { error: 'Password must be at least 6 characters long' };
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ email: email.toLowerCase() });
    if (existingStudent) {
      console.log('❌ registerUser - Student already exists:', email);
      return { error: 'An account with this email already exists' };
    }

    console.log('📝 Creating student with PLAIN password (model will hash it automatically)...');

    // Create student with PLAIN password - the model's pre-save hook will hash it
    const student = await Student.create({
      name,
      email: email.toLowerCase(),
      password: password, // PLAIN TEXT - model will hash it automatically
      year: parseInt(year),
      college,
      role: 'student',
      profiles: {},
      interests: [],
      roadmapProgress: [],
      brandingProgress: [],
      savedResources: [],
      learningStats: {
        totalTimeSpent: 0,
        stepsCompleted: 0,
        resourcesViewed: 0,
        lastActive: new Date(),
        currentStreak: 0,
        longestStreak: 0,
        loginCount: 0,
        averageEngagement: 0,
        totalCodeSubmissions: 0,
        totalProjectSubmissions: 0
      },
      activityLog: [],
      languages: [],
      preferredLanguage: 'python'
    });

    console.log('✅ registerUser - Student created successfully');
    console.log('📧 Email:', student.email);
    console.log('👤 Name:', student.name);
    console.log('🎯 Role:', student.role);
    console.log('🔑 Final stored password:', student.password.substring(0, 30) + '...');
    
    // Redirect to login page with success message
    console.log('🔄 registerUser - Redirecting to login...');
    redirect('/students-auth/login?message=Account+created+successfully.+Please+login.&t=' + Date.now());
    
  } catch (error: any) {
    // Check if this is a redirect error (which is actually success)
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      console.log('✅ registerUser - Redirecting to login...');
      throw error;
    }
    
    console.error('❌ registerUser - Registration error:', error);
    
    if (error.message?.includes('connect')) {
      return { error: 'Database connection failed. Please try again.' };
    } else if (error.code === 11000) {
      return { error: 'An account with this email already exists.' };
    } else {
      return { error: 'Failed to create account. Please try again.' };
    }
  }
}