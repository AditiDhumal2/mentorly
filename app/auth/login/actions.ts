'use server';

import { redirect } from 'next/navigation';

// Database connection function
async function connectDB() {
  try {
    const mongoose = await import('mongoose');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mentorly';

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    // If already connected, return the connection
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    return mongoose.connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to database');
  }
}

export async function loginUser(prevState: any, formData: FormData) {
  try {
    await connectDB();
    
    const mongoose = await import('mongoose');
    const bcrypt = await import('bcryptjs');

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Validate inputs
    if (!email || !password) {
      return { error: 'Email and password are required' };
    }

    // Define User schema
    const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      role: { type: String, enum: ['student', 'mentor', 'admin'], default: 'student' },
      year: { type: Number, required: true },
      college: { type: String, required: true },
    }, { timestamps: true });

    // Get or create User model
    const User = mongoose.models.User || mongoose.model('User', userSchema);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return { error: 'No account found with this email' };
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return { error: 'Incorrect password. Please try again.' };
    }

    console.log('Login successful for:', email);
    
    // TODO: Create session or JWT token
    // For now, redirect to dashboard
    // This will throw an error to stop execution, which is normal
    redirect('/dashboard');
    
  } catch (error: any) {
    // Check if this is a redirect error (which is actually success)
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      // This is a successful redirect, not an error
      console.log('Redirecting to dashboard...');
      throw error; // Re-throw the redirect
    }
    
    console.error('Login error:', error);
    return { error: 'Failed to login. Please try again.' };
  }
}