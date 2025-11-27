// lib/db.ts
import mongoose from 'mongoose';

// Validate and get the MONGODB_URI with proper typing
function getMongoDBUri(): string {
  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }
  
  return MONGODB_URI;
}

const MONGODB_URI = getMongoDBUri();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongoose || {
  conn: null,
  promise: null,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    console.log('🚀 Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4,
    };

    console.log('🔌 Connecting to MongoDB Atlas...');
    
    // Now MONGODB_URI is guaranteed to be a string
    const connectionString = MONGODB_URI;
    const dbName = connectionString.split('/').pop()?.split('?')[0] || 'unknown';
    console.log('📝 Database:', dbName);
    
    cached.promise = mongoose.connect(connectionString, options)
      .then((mongoose) => {
        console.log('✅ MongoDB Atlas connected successfully');
        console.log('🏠 Database:', mongoose.connection.db?.databaseName);
        console.log('📊 Host:', mongoose.connection.host);
        return mongoose;
      })
      .catch((error) => {
        console.error('❌ MongoDB connection failed:');
        console.error('   Error:', error.message);
        console.error('   Code:', error.code);
        console.error('   Connection string used:', connectionString.replace(/:[^:@]*@/, ':****@'));
        cached.promise = null;
        throw new Error(`Database connection failed: ${error.message}`);
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error('💥 Failed to establish MongoDB connection:', error);
    throw error;
  }

  return cached.conn;
}

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('🔗 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('👋 MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('💥 Error closing MongoDB connection:', error);
    process.exit(1);
  }
});