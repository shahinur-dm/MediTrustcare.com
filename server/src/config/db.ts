import mongoose from 'mongoose';
import { seedDatabase } from '../utils/seed';

let cachedPromise: Promise<typeof mongoose> | null = null;
let hasCheckedSeed = false;
let isSeeding = false;

export const connectDB = async (): Promise<typeof mongoose> => {
  // If already connected, return cached mongoose instance immediately
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  // If currently connecting, wait for the pending connection promise
  if (cachedPromise) {
    return cachedPromise;
  }

  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meditrust_erp';
  mongoose.set('strictQuery', false);

  cachedPromise = (async () => {
    try {
      const conn = await mongoose.connect(mongoURI, {
        serverSelectionTimeoutMS: 8000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      });

      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
      await checkAndAutoSeed();
      return conn;
    } catch (error: any) {
      cachedPromise = null; // Clear cached promise on failure so subsequent requests can retry
      const safeUri = mongoURI.replace(/:([^:@]+)@/, ':****@');
      console.error(`[MongoDB Error] Connection failed to ${safeUri}: ${error.message}`);

      // In production or on Vercel, throw the error rather than trying to spawn MongoMemoryServer
      if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
        throw error;
      }

      // Only in local development fallback to MongoMemoryServer
      console.log(`[MongoDB] Initializing zero-config local MongoMemoryServer engine for local development...`);
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        const mongoMemoryServer = await MongoMemoryServer.create();
        const inMemoryUri = mongoMemoryServer.getUri();
        const conn = await mongoose.connect(inMemoryUri);
        console.log(`[MongoDB] Connected successfully to Local Embedded MongoDB: ${conn.connection.host}`);
        await checkAndAutoSeed();
        return conn;
      } catch (memErr: any) {
        console.error(`[MongoDB Error] Failed to start local MongoMemoryServer: ${memErr.message}`);
        throw memErr;
      }
    }
  })();

  return cachedPromise;
};

const checkAndAutoSeed = async () => {
  if (hasCheckedSeed || isSeeding) return;
  try {
    isSeeding = true;
    const { User } = await import('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] Empty database detected. Seeding authentic MediTrust Care BD records...');
      await seedDatabase(false); // don't exit process
      console.log('[AutoSeed] MediTrust Care BD database initialized and ready!');
    } else {
      console.log(`[MongoDB] Database already initialized with ${userCount} users.`);
    }
    hasCheckedSeed = true;
  } catch (e: any) {
    console.warn('[AutoSeed Notice]', e.message);
  } finally {
    isSeeding = false;
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database.');
  cachedPromise = null;
});
