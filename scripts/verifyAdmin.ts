// scripts/verifyAdmin.ts
import { connectDB } from '@/lib/db';
import { Admin } from '@/models/Admins';

async function verifyAdmin(): Promise<void> {
  try {
    await connectDB();
    const admin = await Admin.findOne({ email: 'admin@mentorly.com' });
    
    if (admin) {
      console.log('✅ Admin user found:', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isActive: admin.isActive
      });
    } else {
      console.log('❌ Admin user not found');
    }
  } catch (error) {
    console.error('Error verifying admin:', error);
  }
}

verifyAdmin();