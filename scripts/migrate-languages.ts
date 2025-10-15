import { connectDB } from '../lib/db';
import { User } from '../models/Students';

async function migrateLanguages(): Promise<void> {
  try {
    await connectDB();
    
    console.log('Starting language migration...');
    
    // Get all users
    const users = await User.find({});
    let migratedCount = 0;
    
    for (const user of users) {
      const userDoc = user as any;
      let needsSave = false;
      
      // Initialize preferredLanguage if missing
      if (!userDoc.preferredLanguage) {
        userDoc.preferredLanguage = 'python';
        needsSave = true;
      }
      
      // Initialize languages array if missing
      if (!userDoc.languages) {
        userDoc.languages = [];
        needsSave = true;
      }
      
      // Add current preferred language to languages array if not present
      const languageExists = userDoc.languages.some((lang: any) => lang.languageId === userDoc.preferredLanguage);
      if (!languageExists && userDoc.preferredLanguage) {
        userDoc.languages.push({
          languageId: userDoc.preferredLanguage,
          proficiency: 'beginner',
          startedAt: new Date()
        });
        needsSave = true;
      }
      
      if (needsSave) {
        await userDoc.save();
        migratedCount++;
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} users`);
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateLanguages();