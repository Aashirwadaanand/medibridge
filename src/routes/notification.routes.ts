import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateNotificationPayload, validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Secure all endpoints below with JWT verification
router.use(authenticateUser);

/**
 * @route   GET /api/notifications
 * @desc    Get user-specific notifications
 * @access  Private (All authenticated roles)
 */
router.get(
  '/',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  NotificationController.listNotifications
);

/**
 * @route   PUT /api/notifications/:id
 * @desc    Mark a notification as read
 * @access  Private (Only the notification recipient)
 */
router.put(
  '/:id',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  validateRouteId('id'),
  NotificationController.markAsRead
);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification entry
 * @access  Private (Only the notification recipient or Admin)
 */
router.delete(
  '/:id',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  validateRouteId('id'),
  NotificationController.deleteNotification
);

/**
 * @route   POST /api/notifications
 * @desc    Create/Send a new notification
 * @access  Private (Admins, Doctors, Hospitals only)
 */
router.post(
  '/',
  authorizeRoles('admin', 'doctor', 'hospital'),
  validateNotificationPayload,
  NotificationController.createNotification
);

export default router;
