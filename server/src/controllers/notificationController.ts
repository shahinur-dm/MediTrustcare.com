import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { Notification } from '../models/Notification';

export const getNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notifications = await Notification.find({
      $or: [{ targetUser: req.user?._id }, { targetRole: req.user?.role }, { targetRole: { $exists: false } }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      isRead: false,
      $or: [{ targetUser: req.user?._id }, { targetRole: req.user?.role }, { targetRole: { $exists: false } }],
    });

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications', error: error.message });
  }
};

export const markAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await Notification.updateMany(
      {
        $or: [{ targetUser: req.user?._id }, { targetRole: req.user?.role }, { targetRole: { $exists: false } }],
      },
      { isRead: true }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Failed to update notifications', error: error.message });
  }
};
