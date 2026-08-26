/**
 * MongoDB connection utility for Next.js serverless functions
 * Handles connection caching to prevent exhausting database connections
 */

import mongoose from 'mongoose';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
declare global {
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error(
      'Please define the MONGODB_URI environment variable (Vercel Project Settings → Environment Variables, or .env.local locally).'
    );
  }
  return uri;
}

/**
 * Connect to MongoDB (cached for serverless)
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = getMongoUri();
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongooseInstance) => {
      console.log('✅ MongoDB connected successfully');
      return mongooseInstance;
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

/**
 * Disconnect from MongoDB (usually not needed in serverless)
 */
export async function disconnectDB(): Promise<void> {
  if (!cached.conn) {
    return;
  }

  try {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
    console.log('MongoDB disconnected');
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

export default mongoose;
