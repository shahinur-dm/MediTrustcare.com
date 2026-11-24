import { Server as SocketIOServer } from 'socket.io';
import { Notification } from '../models/Notification';

let ioInstance: SocketIOServer | null = null;

export const initNotificationSocket = (io: SocketIOServer) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    socket.on('join_role', (role: string) => {
      socket.join(`role:${role}`);
    });
    socket.on('join_user', (userId: string) => {
      socket.join(`user:${userId}`);
    });
  });
};

export const createNotification = async (params: {
  title: string;
  message: string;
  type: 'low_stock' | 'near_expiry' | 'order_approval' | 'delivery_update' | 'payment_received' | 'system';
  severity?: 'info' | 'warning' | 'error' | 'success';
  targetRole?: string;
  targetUser?: any;
  actionUrl?: string;
  metadata?: any;
}) => {
  try {
    const notification = await Notification.create({
      title: params.title,
      message: params.message,
      type: params.type,
      severity: params.severity || 'info',
      targetRole: params.targetRole,
      targetUser: params.targetUser,
      actionUrl: params.actionUrl,
      metadata: params.metadata,
      isRead: false,
    });

    if (ioInstance) {
      if (params.targetUser) {
        ioInstance.to(`user:${params.targetUser.toString()}`).emit('notification', notification);
      } else if (params.targetRole) {
        ioInstance.to(`role:${params.targetRole}`).emit('notification', notification);
      } else {
        ioInstance.emit('notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('[Notification Error]', error);
  }
};
