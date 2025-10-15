import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { Admin } from '@/models/Admins';

async function manageAdmin(
  email: string, 
  password: string, 
  name: string,
  action: 'create' | 'reset' = 'create'
) {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorly';
  
  console.log('🔗 Connecting to MongoDB...');
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
    
    console.log(`👤 ${action === 'create' ? 'Creating' : 'Resetting'} admin account:`);
    console.log('📧 Email:', email);
    console.log('🔑 Password:', password);
    console.log('👤 Name:', name);
    
    // Hash the plain text password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await Admin.findOneAndUpdate(
      { email: email.toLowerCase() },
      { 
        name,
        password: hashedPassword,
        role: 'admin',
        permissions: {
          canManageUsers: true,
          canManageContent: true,
          canManageSystem: true,
          canViewAnalytics: true
        },
        isActive: true,
        updatedAt: new Date()
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    console.log(`✅ Admin account ${result.isNew ? 'created' : 'updated'} successfully`);
    console.log('🔑 Hashed password stored');
    
    // Verify password works
    const passwordValid = await bcrypt.compare(password, result.password);
    console.log('🧪 Password verification:', passwordValid ? '✅ SUCCESS' : '❌ FAILED');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

// Create your admin
manageAdmin('aditidhumal08@gmail.com', 'Aditi12', 'Aditi Dhumal', 'reset');