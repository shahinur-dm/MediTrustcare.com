import express from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/errorHandler';
import apiRoutes from './routes/api';
import { initNotificationSocket } from './services/notificationService';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io initialization
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

initNotificationSocket(io);

// Security & Utility Middlewares
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Base Route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    system: 'MediTrust Care Bangladesh ERP',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

export const startServer = async () => {
  await connectDB();
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` MediTrust Care Bangladesh — Enterprise ERP Backend`);
    console.log(` Running on port: ${PORT}`);
    console.log(` Official: https://www.meditrustcarebd.com/`);
    console.log(`=======================================================`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server, io };
