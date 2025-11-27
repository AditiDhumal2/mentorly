// actions/adminAuthActions.ts
'use server';

import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { Admin } from '@/models/Admins';
import bcrypt from 'bcryptjs';

// Admin-specific session verification (NO REDIRECTS)
export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminDataCookie = cookieStore.get('admin-data')?.value;

    if (!adminDataCookie) {
      return { isValid: false, error: 'No admin session found' };
    }

    const adminData = JSON.parse(adminDataCookie);
    
    // Verify it's actually an admin session
    if (adminData.role !== 'admin') {
      return { isValid: false, error: 'Not an admin session' };
    }

    await connectDB();
    const admin = await Admin.findById(adminData.id);
    
    if (!admin) {
      return { isValid: false, error: 'Admin account not found' };
    }

    if (admin.isActive === false) {
      return { isValid: false, error: 'Admin account deactivated' };
    }

    let permissions = admin.permissions || ['read', 'write', 'delete'];
    
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      permissions = { ...permissions };
    }

    return { 
      isValid: true, 
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: 'admin',
        permissions: permissions
      }
    };
  } catch (error) {
    console.error('❌ verifyAdminSession - Error:', error);
    return { isValid: false, error: 'Admin session verification failed' };
  }
}

// For admin dashboard - NO REDIRECT, just return status
export async function requireAdminAuth() {
  const session = await verifyAdminSession();
  
  if (!session.isValid || !session.admin) {
    console.log('🛑 requireAdminAuth - No valid admin session');
    return { authenticated: false, admin: null };
  }
  
  console.log('✅ requireAdminAuth - Admin session valid for:', session.admin.email);
  
  return {
    authenticated: true,
    admin: {
      id: session.admin.id,
      name: session.admin.name,
      email: session.admin.email,
      role: session.admin.role,
      permissions: session.admin.permissions || ['read', 'write', 'delete']
    }
  };
}

// For admin login page - NO REDIRECT, just return status
export async function checkExistingAdminAuth() {
  try {
    const session = await verifyAdminSession();
    
    if (session.isValid) {
      console.log('✅ checkExistingAdminAuth - Admin authenticated');
      return true;
    }
    
    console.log('✅ checkExistingAdminAuth - No admin session');
    return false;
  } catch (error) {
    console.log('✅ checkExistingAdminAuth - Error, assuming no session');
    return false;
  }
}

// Enhanced admin login - NO REDIRECTS
export async function adminLogin(formData: FormData) {
  try {
    await connectDB();
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('🔍 adminLogin - Admin-only login attempt for:', email);

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const admin = await Admin.findOne({ 
      email: email.toLowerCase().trim()
    });
    
    if (!admin) {
      console.log('❌ adminLogin - No admin account found for:', email);
      return { success: false, error: 'No admin account found with this email.' };
    }

    if (admin.isActive === false) {
      console.log('❌ adminLogin - Admin account inactive for:', email);
      return { success: false, error: 'Admin account is deactivated. Please contact system administrator.' };
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    
    if (!isPasswordValid) {
      console.log('❌ adminLogin - Invalid password for:', email);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    let permissions = admin.permissions || ['read', 'write', 'delete'];
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      permissions = { ...permissions };
    }

    const adminData = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: 'admin',
      permissions: permissions,
      loginType: 'admin',
      timestamp: Date.now()
    };

    console.log('✅ adminLogin - Admin login successful for:', email);

    const cookieStore = await cookies();
    
    // Clear ONLY admin cookies (leave student cookies alone)
    cookieStore.delete('admin-data');

    // Set ADMIN-SPECIFIC cookie
    cookieStore.set('admin-data', JSON.stringify(adminData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    console.log('✅ adminLogin - Admin session created with admin-data cookie');
    
    return { success: true, message: 'Login successful' };
    
  } catch (error) {
    console.error('❌ adminLogin - Error:', error);
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

// ADMIN-ONLY logout - doesn't affect student sessions
export async function adminLogout() {
  console.log('🔒 Admin-only logout initiated');
  
  const cookieStore = await cookies();
  
  // Clear ONLY admin-related cookies (preserve student sessions)
  const adminCookies = [
    'admin-data', 
  ];
  
  adminCookies.forEach(cookieName => {
    const hadCookie = !!cookieStore.get(cookieName);
    cookieStore.delete(cookieName);
    console.log(`🗑️ adminLogout - Deleted admin cookie: ${cookieName} - ${hadCookie ? 'HAD_COOKIE' : 'NO_COOKIE'}`);
  });
  
  // Verify admin cookies are cleared but student cookies remain
  const adminDataAfter = cookieStore.get('admin-data');
  const studentDataAfter = cookieStore.get('student-data');
  const userDataAfter = cookieStore.get('user-data');
  
  console.log('✅ adminLogout - Verification:', {
    adminDataAfter: adminDataAfter ? 'STILL_EXISTS' : 'DELETED',
    studentDataAfter: studentDataAfter ? 'STILL_EXISTS' : 'DELETED',
    userDataAfter: userDataAfter ? 'STILL_EXISTS' : 'DELETED'
  });

  console.log('✅ adminLogout - Only admin cookies cleared, student sessions preserved');
  
  // Return redirect URL for client-side navigation
  return { 
    success: true, 
    message: 'Admin logout successful',
    redirectUrl: '/admin-login?logout=success&t=' + Date.now()
  };
}

// Check if user can access admin routes (for client-side checks)
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

// Get current admin session data (for client-side use)
export async function getCurrentAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminDataCookie = cookieStore.get('admin-data')?.value;

    if (!adminDataCookie) {
      return { isLoggedIn: false, admin: null };
    }

    const adminData = JSON.parse(adminDataCookie);
    return { 
      isLoggedIn: true, 
      admin: adminData 
    };
  } catch (error) {
    console.error('❌ getCurrentAdminSession - Error:', error);
    return { isLoggedIn: false, admin: null };
  }
}

// Admin password change
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

// Create admin account (for super admin use)
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

// Update admin account
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

// Get all admin accounts
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

// Delete admin account
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

// Reset admin password
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

// Get admin profile
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

// Update admin profile
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

// ADMIN-ONLY session clear - doesn't affect student sessions
export async function forceClearAdminSessions() {
  try {
    const cookieStore = await cookies();
    
    // Clear ONLY admin cookies
    cookieStore.delete('admin-data');
    cookieStore.delete('admin-token');
    
    console.log('✅ forceClearAdminSessions - Only admin sessions cleared');
    
    return { success: true, message: 'Admin sessions cleared successfully' };
  } catch (error) {
    console.error('❌ forceClearAdminSessions - Error:', error);
    return { error: 'Failed to clear admin sessions' };
  }
}

// Validate admin session for API routes
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

// Refresh admin session (extend cookie lifetime)
export async function refreshAdminSession() {
  try {
    const session = await verifyAdminSession();
    
    if (!session.isValid || !session.admin) {
      return { success: false, error: 'No valid session to refresh' };
    }

    // Ensure permissions is serializable
    let permissions = session.admin.permissions || ['read', 'write', 'delete'];
    if (permissions && typeof permissions === 'object' && !Array.isArray(permissions)) {
      permissions = { ...permissions };
    }

    const adminData = {
      id: session.admin.id,
      name: session.admin.name,
      email: session.admin.email,
      role: 'admin',
      permissions: permissions,
      loginType: 'admin',
      timestamp: Date.now()
    };

    const cookieStore = await cookies();
    
    // Refresh the cookie with updated timestamp
    cookieStore.set('admin-data', JSON.stringify(adminData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    console.log('✅ refreshAdminSession - Session refreshed for admin:', session.admin.email);
    
    return { success: true, message: 'Session refreshed successfully' };
  } catch (error) {
    console.error('❌ refreshAdminSession - Error:', error);
    return { success: false, error: 'Failed to refresh session' };
  }
}

// Helper function to check if user is admin (for mixed auth scenarios)
export async function isUserAdmin() {
  try {
    const session = await verifyAdminSession();
    return session.isValid;
  } catch (error) {
    console.error('❌ isUserAdmin - Error:', error);
    return false;
  }
}

// Check if admin session exists without validation (for middleware)
export async function hasAdminSession() {
  try {
    const cookieStore = await cookies();
    const adminDataCookie = cookieStore.get('admin-data')?.value;
    
    if (!adminDataCookie) {
      return false;
    }
    
    const adminData = JSON.parse(adminDataCookie);
    return adminData.role === 'admin';
  } catch (error) {
    return false;
  }
}