import { connectDB } from '../lib/db';
import { User } from '../models/User';

async function migrateUsers(): Promise<void> {
  try {
    await connectDB();
    
    const result = await User.updateMany(
      { 
        $or: [
          { roadmapProgress: { $exists: false } },
          { roadmapProgress: null }
        ]
      },
      { 
        $set: { roadmapProgress: [] }
      }
    );
    
    console.log(`Migrated ${result.modifiedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateUsers();