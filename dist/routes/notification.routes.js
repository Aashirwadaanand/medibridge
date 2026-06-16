"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const notification_controller_1 = require("../controllers/notification.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Secure all endpoints below with JWT verification
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   GET /api/notifications
 * @desc    Get user-specific notifications
 * @access  Private (All authenticated roles)
 */
router.get('/', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), notification_controller_1.NotificationController.listNotifications);
/**
 * @route   PUT /api/notifications/:id
 * @desc    Mark a notification as read
 * @access  Private (Only the notification recipient)
 */
router.put('/:id', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), notification_controller_1.NotificationController.markAsRead);
/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete a notification entry
 * @access  Private (Only the notification recipient or Admin)
 */
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), notification_controller_1.NotificationController.deleteNotification);
/**
 * @route   POST /api/notifications
 * @desc    Create/Send a new notification
 * @access  Private (Admins, Doctors, Hospitals only)
 */
router.post('/', (0, auth_middleware_1.authorizeRoles)('admin', 'doctor', 'hospital'), validation_middleware_1.validateNotificationPayload, notification_controller_1.NotificationController.createNotification);
exports.default = router;
