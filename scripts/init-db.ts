import { connectDB } from '../lib/db';
import { User } from '../models/User';

async function initializeDatabase() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist, skipping initialization');
      return;
    }

    // Create sample user
    const sampleUser = new User({
      name: 'Test Student',
      email: 'test@student.com',
      password: 'password123', // This will be hashed by the pre-save hook
      role: 'student',
      year: 1,
      college: 'Engineering College',
      interests: ['Web Development', 'Data Science'],
      profiles: {
        github: 'https://github.com/teststudent',
        linkedin: 'https://linkedin.com/in/teststudent'
      }
    });

    await sampleUser.save();
    console.log('✅ Sample user created successfully!');
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  } finally {
    process.exit(0);
  }
}

initializeDatabase();