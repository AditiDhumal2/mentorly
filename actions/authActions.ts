// actions/authActions.ts - UPDATED STUDENT-ONLY VERSION
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import bcrypt from 'bcryptjs';

export async function loginUser(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 loginUser - Student login attempt for:', email);

    // Validate inputs
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // ONLY check Student collection - no admin fallback
    const student = await Student.findOne({ 
      email: email.toLowerCase().trim()
    });
    
    if (!student) {
      return { error: 'No student account found with this email.' };
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Please try again.' };
    }

    const userData = {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: 'student',
      year: student.year,
      college: student.college,
      profiles: student.profiles || {},
      interests: student.interests || []
    };

    console.log('✅ loginUser - Student login successful for:', email);

    // Set student session cookie
    const cookieStore = await cookies();
    
    cookieStore.set('user-data', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    cookieStore.set('user-data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    console.log('✅ loginUser - Student session created');
    
    // Redirect to student dashboard
    redirect('/dashboard');
    
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('❌ loginUser - Error:', error);
    return { error: 'Failed to login. Please try again.' };
  }
}

// Keep your existing logoutUser, getCurrentUser, etc.