'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';

export async function loginUser(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 loginUser - Attempting login for:', email);

    if (!email || !password) {
      redirect('/students-auth/login?error=Email and password are required');
    }

    const student = await Student.findOne({ 
      email: email.toLowerCase().trim()
    });
    
    if (!student) {
      redirect('/students-auth/login?error=No account found with this email');
    }

    const isPasswordValid = await student.comparePassword(password);
    
    if (!isPasswordValid) {
      redirect('/students-auth/login?error=Incorrect password. Please try again');
    }

    console.log('✅ loginUser - Student password valid');
    
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

    console.log('✅ loginUser - Login successful for:', email);

    // SET COOKIE WITH SECURE OPTIONS
    const cookieStore = await cookies();
    
    // Clear any existing cookie first
    cookieStore.delete('user-data');
    
    // Set auth cookie
    cookieStore.set('user-data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    console.log('✅ loginUser - Cookies set successfully');
    
    // SIMPLE REDIRECT - No query parameters needed
    console.log('🔄 loginUser - Redirecting to /students');
    redirect('/students');
    
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('❌ loginUser - Login error:', error);
    redirect('/students-auth/login?error=Failed to login. Please try again');
  }
}