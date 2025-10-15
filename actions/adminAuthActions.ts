// actions/adminAuthActions.ts
'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Admin } from '@/models/Admins';
import bcrypt from 'bcryptjs';

export async function adminLogin(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 adminLogin - Admin-only login attempt for:', email);

    // Validate inputs
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // ONLY check Admin collection - no student fallback
    const admin = await Admin.findOne({ 
      email: email.toLowerCase().trim()
    });
    
    if (!admin) {
      return { error: 'No admin account found with this email.' };
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Please try again.' };
    }

    const userData = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: 'admin'
    };

    console.log('✅ adminLogin - Admin login successful for:', email);

    // Set admin session cookie
    const cookieStore = await cookies();
    
    // Clear any existing cookie
    cookieStore.set('user-data', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    });

    // Set admin cookie
    cookieStore.set('user-data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    console.log('✅ adminLogin - Admin session created');
    
    // Redirect to admin dashboard
    redirect('/admin');
    
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    
    console.error('❌ adminLogin - Error:', error);
    return { error: 'Failed to login. Please try again.' };
  }
}

export async function adminLogout() {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set('user-data', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    console.log('✅ adminLogout - Admin session cleared');
    
    redirect('/admin/login');
  } catch (error: any) {
    console.error('❌ adminLogout - Error:', error);
    redirect('/admin/login');
  }
}