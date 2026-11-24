import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import { connectDB } from './config/db';
import { initNotificationSocket } from './services/notificationService';

const server = http.createServer(app);

// Socket.io initialization for standalone server
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  },
});

initNotificationSocket(io);

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

// Only start listening if NOT in a test environment and NOT on Vercel serverless
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  startServer();
}

export default app;
export { app, server, io };
