// scripts/fix-roadmap-index.ts
import { connectDB } from '../lib/db';
import { Roadmap } from '../models/Roadmap';

async function fixRoadmapIndex() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Drop the problematic unique index on year
    await Roadmap.collection.dropIndex('year_1');
    console.log('✅ Dropped unique index on year field');

    // Create a compound unique index on year + language
    await Roadmap.collection.createIndex({ year: 1, language: 1 }, { unique: true });
    console.log('✅ Created compound unique index on year + language');

  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    process.exit(0);
  }
}

fixRoadmapIndex();