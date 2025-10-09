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

export async function registerUser(prevState: any, formData: FormData) {
  try {
    await connectDB();
    
    const mongoose = await import('mongoose');
    const bcrypt = await import('bcryptjs');

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const year = formData.get('year') as string;
    const college = formData.get('college') as string;

    // Validate required fields
    if (!name || !email || !password || !year || !college) {
      return { error: 'All fields are required' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: 'Please enter a valid email address' };
    }

    // Validate password length
    if (password.length < 6) {
      return { error: 'Password must be at least 6 characters long' };
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { error: 'An account with this email already exists' };
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);
    await User.create({
      name,
      email,
      password: hashedPassword,
      year: parseInt(year),
      college,
      role: 'student'
    });

    console.log('User created successfully:', email);
    
    // Redirect to login page with success message
    // This will throw an error to stop execution, which is normal
    redirect('/auth/login?message=Account created successfully. Please login.');
    
  } catch (error: any) {
    // Check if this is a redirect error (which is actually success)
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      // This is a successful redirect, not an error
      console.log('Redirecting to login...');
      throw error; // Re-throw the redirect
    }
    
    console.error('Registration error:', error);
    
    // More specific error messages
    if (error.message.includes('connect')) {
      return { error: 'Database connection failed. Please try again.' };
    } else if (error.code === 11000) {
      return { error: 'An account with this email already exists.' };
    } else {
      return { error: 'Failed to create account. Please try again.' };
    }
  }
}