'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Admin } from '@/models/Admins';
import bcrypt from 'bcryptjs';

// Enhanced session verification with cache control
export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const userDataCookie = cookieStore.get('user-data')?.value;

    if (!userDataCookie) {
      return { isValid: false, error: 'No session found' };
    }

    const userData = JSON.parse(userDataCookie);
    
    if (userData.role !== 'admin') {
      return { isValid: false, error: 'Not an admin session' };
    }

    await connectDB();
    const admin = await Admin.findById(userData.id);
    
    if (!admin) {
      return { isValid: false, error: 'Admin account not found' };
    }

    if (admin.isActive === false) {
      return { isValid: false, error: 'Admin account deactivated' };
    }

    return { 
      isValid: true, 
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: 'admin',
        permissions: admin.permissions || ['read', 'write', 'delete']
      }
    };
  } catch (error) {
    console.error('❌ verifyAdminSession - Error:', error);
    return { isValid: false, error: 'Session verification failed' };
  }
}

// Enhanced admin login with cache busting - SIMPLIFIED VERSION
export async function adminLogin(formData: FormData) {
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
    console.log('❌ adminLogin - No admin account found for:', email);
    return { error: 'No admin account found with this email.' };
  }

  // Check if admin account is active
  if (admin.isActive === false) {
    console.log('❌ adminLogin - Admin account inactive for:', email);
    return { error: 'Admin account is deactivated. Please contact system administrator.' };
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  
  if (!isPasswordValid) {
    console.log('❌ adminLogin - Invalid password for:', email);
    return { error: 'Incorrect password. Please try again.' };
  }

  const userData = {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: 'admin',
    permissions: admin.permissions || ['read', 'write', 'delete'],
    timestamp: Date.now()
  };

  console.log('✅ adminLogin - Admin login successful for:', email);

  // Set admin session cookie
  const cookieStore = await cookies();
  
  // Clear any existing cookie first
  cookieStore.delete('user-data');
  cookieStore.delete('admin-token');
  cookieStore.delete('session');

  // Set admin cookie with secure settings
  cookieStore.set('user-data', JSON.stringify(userData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/'
  });

  console.log('✅ adminLogin - Admin session created');
  
  // Redirect to admin dashboard with cache busting
  redirect('/admin?t=' + Date.now());
}

// Enhanced logout with cache clearing - SIMPLIFIED VERSION
export async function adminLogout() {
  console.log('🔒 Admin logout initiated');
  
  const cookieStore = await cookies();
  
  // Clear all auth-related cookies
  cookieStore.delete('user-data');
  cookieStore.delete('admin-token');
  cookieStore.delete('session');
  
  console.log('✅ adminLogout - All cookies cleared');
  
  // Redirect to login with cache busting parameters
  redirect('/admin-login?logout=success&t=' + Date.now() + '&cache=bust');
}

// Add this new function to check and handle protected routes
export async function requireAdminAuth() {
  const session = await verifyAdminSession();
  
  if (!session.isValid) {
    redirect('/admin-login?auth=required&t=' + Date.now());
  }
  
  return session.admin;
}

// Add this function to check if user is already authenticated (for login page)
export async function checkExistingAdminAuth() {
  const session = await verifyAdminSession();
  
  if (session.isValid) {
    redirect('/admin?t=' + Date.now());
  }
  
  return null;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    await connectDB();
    const admin = await Admin.findById(session.admin.id);
    
    if (!admin) {
      return { error: 'Admin account not found' };
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
    if (!isCurrentPasswordValid) {
      return { error: 'Current password is incorrect' };
    }

    // Validate new password
    if (newPassword.length < 8) {
      return { error: 'New password must be at least 8 characters long' };
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password
    admin.password = hashedNewPassword;
    admin.updatedAt = new Date();
    await admin.save();

    console.log('✅ changeAdminPassword - Password updated for admin:', session.admin.email);
    
    return { success: true, message: 'Password updated successfully' };
  } catch (error) {
    console.error('❌ changeAdminPassword - Error:', error);
    return { error: 'Failed to change password' };
  }
}

export async function createAdminAccount(adminData: {
  name: string;
  email: string;
  password: string;
  permissions?: string[];
}) {
  try {
    // Verify that the current user is an admin with create permissions
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    if (!session.admin.permissions.includes('create')) {
      return { error: 'Insufficient permissions to create admin accounts' };
    }

    await connectDB();

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminData.email.toLowerCase().trim() });
    if (existingAdmin) {
      return { error: 'Admin account with this email already exists' };
    }

    // Validate password
    if (adminData.password.length < 8) {
      return { error: 'Password must be at least 8 characters long' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    // Create new admin
    const newAdmin = new Admin({
      name: adminData.name.trim(),
      email: adminData.email.toLowerCase().trim(),
      password: hashedPassword,
      permissions: adminData.permissions || ['read'],
      isActive: true,
      createdBy: session.admin.id
    });

    await newAdmin.save();

    console.log('✅ createAdminAccount - New admin created by:', session.admin.email, 'for:', adminData.email);
    
    return { 
      success: true, 
      message: 'Admin account created successfully',
      adminId: newAdmin._id.toString()
    };
  } catch (error) {
    console.error('❌ createAdminAccount - Error:', error);
    return { error: 'Failed to create admin account' };
  }
}

export async function updateAdminAccount(adminId: string, updateData: {
  name?: string;
  permissions?: string[];
  isActive?: boolean;
}) {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    if (!session.admin.permissions.includes('write')) {
      return { error: 'Insufficient permissions to update admin accounts' };
    }

    await connectDB();

    // Prevent self-deactivation
    if (adminId === session.admin.id && updateData.isActive === false) {
      return { error: 'Cannot deactivate your own account' };
    }

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return { error: 'Admin account not found' };
    }

    // Update fields
    if (updateData.name) admin.name = updateData.name.trim();
    if (updateData.permissions) admin.permissions = updateData.permissions;
    if (typeof updateData.isActive === 'boolean') admin.isActive = updateData.isActive;
    
    admin.updatedAt = new Date();
    await admin.save();

    console.log('✅ updateAdminAccount - Admin updated by:', session.admin.email, 'for adminId:', adminId);
    
    return { success: true, message: 'Admin account updated successfully' };
  } catch (error) {
    console.error('❌ updateAdminAccount - Error:', error);
    return { error: 'Failed to update admin account' };
  }
}

export async function getAdminAccounts() {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    if (!session.admin.permissions.includes('read')) {
      return { error: 'Insufficient permissions to view admin accounts' };
    }

    await connectDB();

    const admins = await Admin.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Properly type the lean results
    const formattedAdmins = admins.map((admin: any) => ({
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      permissions: admin.permissions,
      isActive: admin.isActive,
      createdAt: admin.createdAt,
      updatedAt: admin.updatedAt,
      createdBy: admin.createdBy
    }));

    return { success: true, admins: formattedAdmins };
  } catch (error) {
    console.error('❌ getAdminAccounts - Error:', error);
    return { error: 'Failed to fetch admin accounts' };
  }
}

export async function deleteAdminAccount(adminId: string) {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    if (!session.admin.permissions.includes('delete')) {
      return { error: 'Insufficient permissions to delete admin accounts' };
    }

    // Prevent self-deletion
    if (adminId === session.admin.id) {
      return { error: 'Cannot delete your own account' };
    }

    await connectDB();

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return { error: 'Admin account not found' };
    }

    await Admin.findByIdAndDelete(adminId);

    console.log('✅ deleteAdminAccount - Admin deleted by:', session.admin.email, 'for adminId:', adminId);
    
    return { success: true, message: 'Admin account deleted successfully' };
  } catch (error) {
    console.error('❌ deleteAdminAccount - Error:', error);
    return { error: 'Failed to delete admin account' };
  }
}

export async function resetAdminPassword(adminId: string, newPassword: string) {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    if (!session.admin.permissions.includes('write')) {
      return { error: 'Insufficient permissions to reset passwords' };
    }

    // Validate new password
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long' };
    }

    await connectDB();

    const admin = await Admin.findById(adminId);
    if (!admin) {
      return { error: 'Admin account not found' };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    admin.password = hashedPassword;
    admin.updatedAt = new Date();
    await admin.save();

    console.log('✅ resetAdminPassword - Password reset by:', session.admin.email, 'for adminId:', adminId);
    
    return { success: true, message: 'Password reset successfully' };
  } catch (error) {
    console.error('❌ resetAdminPassword - Error:', error);
    return { error: 'Failed to reset password' };
  }
}

export async function getAdminProfile() {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    await connectDB();

    const admin = await Admin.findById(session.admin.id)
      .select('-password')
      .lean();

    if (!admin) {
      return { error: 'Admin account not found' };
    }

    // Properly type the lean result
    const typedAdmin = admin as any;
    const profile = {
      id: typedAdmin._id.toString(),
      name: typedAdmin.name,
      email: typedAdmin.email,
      permissions: typedAdmin.permissions,
      isActive: typedAdmin.isActive,
      createdAt: typedAdmin.createdAt,
      updatedAt: typedAdmin.updatedAt
    };

    return { success: true, profile };
  } catch (error) {
    console.error('❌ getAdminProfile - Error:', error);
    return { error: 'Failed to fetch admin profile' };
  }
}

export async function updateAdminProfile(updateData: {
  name?: string;
}) {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { error: 'Authentication required' };
    }

    await connectDB();

    const admin = await Admin.findById(session.admin.id);
    if (!admin) {
      return { error: 'Admin account not found' };
    }

    if (updateData.name) {
      admin.name = updateData.name.trim();
    }
    
    admin.updatedAt = new Date();
    await admin.save();

    console.log('✅ updateAdminProfile - Profile updated for admin:', session.admin.email);
    
    return { success: true, message: 'Profile updated successfully' };
  } catch (error) {
    console.error('❌ updateAdminProfile - Error:', error);
    return { error: 'Failed to update profile' };
  }
}

// New function: Force clear all sessions (for security purposes)
export async function forceClearAllSessions() {
  try {
    const cookieStore = await cookies();
    
    // Clear all possible auth cookies
    cookieStore.delete('user-data');
    cookieStore.delete('admin-token');
    cookieStore.delete('session');
    cookieStore.delete('auth-token');
    cookieStore.delete('next-auth.session-token');
    cookieStore.delete('next-auth.csrf-token');
    
    console.log('✅ forceClearAllSessions - All sessions cleared');
    
    return { success: true, message: 'All sessions cleared successfully' };
  } catch (error) {
    console.error('❌ forceClearAllSessions - Error:', error);
    return { error: 'Failed to clear sessions' };
  }
}

// New function: Check if user can access admin routes (for client-side checks)
export async function canAccessAdmin() {
  try {
    const session = await verifyAdminSession();
    return { 
      canAccess: session.isValid, 
      admin: session.isValid ? session.admin : null 
    };
  } catch (error) {
    console.error('❌ canAccessAdmin - Error:', error);
    return { canAccess: false, admin: null };
  }
}

// New function: Validate admin session for API routes
export async function validateAdminSessionForAPI() {
  const session = await verifyAdminSession();
  
  if (!session.isValid) {
    return { 
      success: false, 
      error: session.error || 'Invalid session',
      status: 401 
    };
  }
  
  return { 
    success: true, 
      admin: session.admin,
      status: 200
    };
}

// New function: Refresh admin session (extend cookie lifetime)
export async function refreshAdminSession() {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { success: false, error: 'No valid session to refresh' };
    }

    const userData = {
      id: session.admin.id,
      name: session.admin.name,
      email: session.admin.email,
      role: 'admin',
      permissions: session.admin.permissions,
      timestamp: Date.now()
    };

    const cookieStore = await cookies();
    
    // Refresh the cookie with updated timestamp
    cookieStore.set('user-data', JSON.stringify(userData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });

    console.log('✅ refreshAdminSession - Session refreshed for admin:', session.admin.email);
    
    return { success: true, message: 'Session refreshed successfully' };
  } catch (error) {
    console.error('❌ refreshAdminSession - Error:', error);
    return { success: false, error: 'Failed to refresh session' };
  }
}