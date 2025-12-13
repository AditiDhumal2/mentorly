'use server';

import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Student } from '@/models/Students';
import bcrypt from 'bcryptjs';

export async function studentLogin(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 studentLogin - Student login attempt for:', email);

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const student = await Student.findOne({ 
      email: email.toLowerCase().trim()
    }).select('+password'); // CRITICAL: Include password field
    
    if (!student) {
      console.log('❌ studentLogin - No student account found for:', email);
      return { success: false, error: 'No student account found with this email.' };
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    
    if (!isPasswordValid) {
      console.log('❌ studentLogin - Invalid password for:', email);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    // Create student session data
    const studentData = {
      id: student._id.toString(),
      name: student.name,
      email: student.email,
      role: 'student',
      year: student.year,
      college: student.college,
      profilePhoto: student.profilePhoto,
      timestamp: Date.now()
    };

    console.log('✅ studentLogin - Student login successful for:', student.name);

    const cookieStore = await cookies();
    
    // Clear old cookies
    const oldCookies = ['student-data', 'user-data', 'student-session-v2'];
    oldCookies.forEach(cookieName => {
      cookieStore.delete(cookieName);
    });

    // SET COOKIE WITHOUT httpOnly (so client can read it)
    cookieStore.set('student-session-v2', JSON.stringify(studentData), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    console.log('✅ studentLogin - Student session created');
    
    return { 
      success: true, 
      error: null,
      session: studentData // Return session for client
    };
    
  } catch (error) {
    console.error('❌ studentLogin - Error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}