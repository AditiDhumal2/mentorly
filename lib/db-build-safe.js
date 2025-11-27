// lib/db-build-safe.js
let mongoose;

// Only try to import mongoose if we're not in build mode
if (process.env.NEXT_PHASE !== 'build') {
  try {
    mongoose = require('mongoose');
  } catch (e) {
    // Ignore during build
  }
}

const MONGODB_URI = process.env.MONGODB_URI;

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  // If no MONGODB_URI or during build, return mock
  if (!MONGODB_URI || process.env.NEXT_PHASE === 'build') {
    return { isMock: true };
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
