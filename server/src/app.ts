import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes/api';

// Load .env from root or server directory
if (fs.existsSync(path.resolve(__dirname, '../../.env'))) {
  dotenv.config({ path: path.resolve(__dirname, '../../.env') });
} else if (fs.existsSync(path.resolve(__dirname, '../.env'))) {
  dotenv.config({ path: path.resolve(__dirname, '../.env') });
} else {
  dotenv.config();
}

const app = express();

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests from all origins (Vercel frontend domain, preview domains, localhost)
      callback(null, true);
    },
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Database connection middleware ensures active DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err: any) {
    console.error('[Database Middleware Error]', err?.message);
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please check MongoDB Atlas connectivity.',
      error: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    });
  }
});

// Base Route / Health Check (both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'healthy',
    system: 'MediTrust Care Bangladesh ERP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes: mount both at /api and / to handle direct and rewritten serverless invocations
app.use('/api', apiRoutes);
app.use('/', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

export default app;
export { app };
