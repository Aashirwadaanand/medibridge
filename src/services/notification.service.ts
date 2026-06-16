import Notification from '../models/notification.model';
import User from '../models/user.model';
import { INotification, NotificationType } from '../types/notification.interface';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Types } from 'mongoose';

export class NotificationService {
  /**
   * Create and send a new notification (Admins, Doctors, Hospitals only).
   */
  public static async createNotification(
    recipientId: string,
    title: string,
    message: string,
    type: NotificationType
  ): Promise<INotification> {
    // 1. Verify recipient user exists in database
    const user = await User.findById(recipientId);
    if (!user) {
      throw new BadRequestError('The recipient user was not found.');
    }

    // 2. Create the notification document
    const notification = new Notification({
      userId: new Types.ObjectId(recipientId),
      title,
      message,
      type,
      isRead: false,
    });

    await notification.save();
    return notification;
  }

  /**
   * List notifications for a specific user (filters by ownership, unless Admin).
   */
  public static async listNotifications(userId: string, role: string): Promise<INotification[]> {
    let filter = {};

    // Standard users only see their own notifications. Admins can view all.
    if (role !== 'admin') {
      filter = { userId: new Types.ObjectId(userId) };
    }

    return Notification.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 });
  }

  /**
   * Mark a notification as read (Enforces ownership).
   */
  public static async markAsRead(notificationId: string, userId: string): Promise<INotification> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found.');
    }

    // Security check: Only the recipient can mark a notification as read
    if (notification.userId.toString() !== userId) {
      throw new ForbiddenError('Access denied. You can only read your own notifications.');
    }

    notification.isRead = true;
    await notification.save();
    return notification;
  }

  /**
   * Delete a notification (Enforces ownership or Admin privileges).
   */
  public static async deleteNotification(notificationId: string, userId: string, role: string): Promise<void> {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new NotFoundError('Notification not found.');
    }

    // Security check: Only the recipient or an admin can delete
    const isOwner = notification.userId.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isOwner && !isAdmin) {
      throw new ForbiddenError('Access denied. You can only delete your own notifications.');
    }

    await Notification.findByIdAndDelete(notificationId);
  }
}
export default NotificationService;
