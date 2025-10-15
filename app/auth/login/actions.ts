'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Admin } from '@/models/Admins';
import { Student } from '@/models/Students';
import bcrypt from 'bcryptjs';

export async function loginUser(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 loginUser - Attempting login for:', email);
    console.log('🔑 Password received:', password ? '***' : 'undefined');

    // Validate inputs
    if (!email || !password) {
      console.log('❌ loginUser - Missing email or password');
      return { error: 'Email and password are required' };
    }

    let userData: any = null;
    let userRole: string = '';

    // Try to find user in Admin collection first
    console.log('🔍 loginUser - Checking Admin collection for:', email.toLowerCase());
    const admin = await Admin.findOne({ 
      email: email.toLowerCase().trim()
    });
    
    if (admin) {
      console.log('🔍 loginUser - Admin found:', admin.name);
      console.log('🔑 Stored admin hash:', admin.password.substring(0, 20) + '...');
      
      // Check admin password
      console.log('🔑 Comparing admin password...');
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      console.log('🔑 Password comparison result:', isPasswordValid);
      
      if (isPasswordValid) {
        console.log('✅ loginUser - Admin password valid');
        userData = {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          role: 'admin'
        };
        userRole = 'admin';
      } else {
        console.log('❌ loginUser - Invalid admin password');
        return { error: 'Incorrect password. Please try again.' };
      }
    } else {
      // If not in Admin collection, check Student collection
      console.log('🔍 loginUser - Checking Student collection for:', email.toLowerCase());
      const student = await Student.findOne({ 
        email: email.toLowerCase().trim()
      });
      
      if (student) {
        console.log('🔍 loginUser - Student found:', student.name);
        console.log('🔍 loginUser - Student ID:', student._id.toString());
        console.log('🔑 Stored student hash:', student.password.substring(0, 20) + '...');
        
        // Check student password
        console.log('🔑 Comparing student password...');
        const isPasswordValid = await bcrypt.compare(password, student.password);
        console.log('🔑 Password comparison result:', isPasswordValid);
        
        if (isPasswordValid) {
          console.log('✅ loginUser - Student password valid');
          
          userData = {
            id: student._id.toString(),
            name: student.name,
            email: student.email,
            role: 'student',
            year: student.year,
            college: student.college,
            profiles: student.profiles || {},
            interests: student.interests || []
          };
          userRole = 'student';
        } else {
          console.log('❌ loginUser - Invalid student password');
          return { error: 'Incorrect password. Please try again.' };
        }
      } else {
        console.log('❌ loginUser - No user found in any collection for email:', email);
        return { error: 'No account found with this email. Please check your email or register.' };
      }
    }

    if (!userData) {
      console.log('❌ loginUser - No user data found');
      return { error: 'Login failed. Please try again.' };
    }

    console.log('✅ loginUser - Login successful for:', email, 'Role:', userRole);

    // SET THE USER COOKIE
    const cookieStore = await cookies();
    
    // Clear any existing cookie first to avoid stale data
    cookieStore.delete('user-data');
    
    // Set auth cookie with user data
    cookieStore.set('user-data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    console.log('✅ loginUser - Cookies set successfully');
    
    // Redirect based on role
    console.log('🔄 loginUser - Redirecting based on role:', userRole);
    if (userRole === 'admin') {
      console.log('🔄 loginUser - Redirecting admin to /admin');
      redirect('/admin');
    } else {
      console.log('🔄 loginUser - Redirecting student to /dashboard');
      redirect('/dashboard');
    }
    
  } catch (error: any) {
    // Check if this is a redirect error (which is actually success)
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      console.log('✅ loginUser - Redirect successful');
      throw error; // Re-throw the redirect
    }
    
    console.error('❌ loginUser - Login error:', error);
    return { error: 'Failed to login. Please try again.' };
  }
}