import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { seedDatabase } from '../utils/seed';

let mongoMemoryServer: MongoMemoryServer | null = null;

export const connectDB = async (): Promise<void> => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/meditrust_erp';
  mongoose.set('strictQuery', false);

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    await checkAndAutoSeed();
  } catch (error: any) {
    console.warn(`[MongoDB] Could not connect to external MongoDB at ${mongoURI}.`);
    console.log(`[MongoDB] Initializing zero-config local MongoMemoryServer engine...`);
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoMemoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[MongoDB] Connected successfully to Local Embedded MongoDB: ${conn.connection.host}`);
      await checkAndAutoSeed();
    } catch (memErr: any) {
      console.error(`[MongoDB Error] Failed to start local MongoMemoryServer: ${memErr.message}`);
    }
  }
};

const checkAndAutoSeed = async () => {
  try {
    const { User } = await import('../models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[AutoSeed] Empty database detected. Seeding authentic MediTrust Care BD records...');
      await seedDatabase(false); // don't exit process
      console.log('[AutoSeed] MediTrust Care BD database initialized and ready!');
    } else {
      console.log(`[MongoDB] Database already initialized with ${userCount} users.`);
    }
  } catch (e: any) {
    console.warn('[AutoSeed Notice]', e.message);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[MongoDB] Disconnected from database.');
});

