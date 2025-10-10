import { cookies } from 'next/headers';
import { connectDB } from './db';
import { User } from '../models/User';

export async function getCurrentUser() {
  try {
    await connectDB();
    
    // Get user from session/cookie
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;
    
    // For testing, if no userId in cookies, return the first user
    if (!userId) {
      const user = await User.findOne().select('name email year role college profiles interests').lean();
      if (!user) {
        return null;
      }
      
      const userData = user as any;
      return {
        id: userData._id.toString(),
        name: userData.name,
        email: userData.email,
        year: userData.year,
        role: userData.role,
        college: userData.college,
        profiles: userData.profiles,
        interests: userData.interests
      };
    }
    
    const user = await User.findById(userId)
      .select('name email year role college profiles interests')
      .lean();
    
    if (!user) {
      return null;
    }
    
    const userData = user as any;
    return {
      id: userData._id.toString(),
      name: userData.name,
      email: userData.email,
      year: userData.year,
      role: userData.role,
      college: userData.college,
      profiles: userData.profiles,
      interests: userData.interests
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}