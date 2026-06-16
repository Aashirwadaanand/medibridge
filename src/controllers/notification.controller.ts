import { Request, Response } from 'express';
import NotificationService from '../services/notification.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export class NotificationController {
  /**
   * Create and send a new notification
   * POST /api/notifications
   */
  public static createNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, title, message, type } = req.body;

    const notification = await NotificationService.createNotification(userId, title, message, type);

    res.status(201).json({
      status: 'success',
      message: 'Notification sent successfully.',
      data: {
        notification,
      },
    });
  });

  /**
   * List user-specific notifications
   * GET /api/notifications
   */
  public static listNotifications = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const notifications = await NotificationService.listNotifications(req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      results: notifications.length,
      data: {
        notifications,
      },
    });
  });

  /**
   * Mark a notification as read (represented as PUT /api/notifications/:id)
   * PUT /api/notifications/:id
   */
  public static markAsRead = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await NotificationService.markAsRead(notificationId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Notification marked as read.',
      data: {
        notification,
      },
    });
  });

  /**
   * Delete a notification
   * DELETE /api/notifications/:id
   */
  public static deleteNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const notificationId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    await NotificationService.deleteNotification(notificationId, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Notification deleted successfully.',
    });
  });
}
export default NotificationController;
