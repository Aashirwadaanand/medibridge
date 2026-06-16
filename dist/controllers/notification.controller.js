"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationController = void 0;
const notification_service_1 = __importDefault(require("../services/notification.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class NotificationController {
    /**
     * Create and send a new notification
     * POST /api/notifications
     */
    static createNotification = (0, asyncHandler_1.default)(async (req, res) => {
        const { userId, title, message, type } = req.body;
        const notification = await notification_service_1.default.createNotification(userId, title, message, type);
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
    static listNotifications = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const notifications = await notification_service_1.default.listNotifications(req.user.id, req.user.role);
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
    static markAsRead = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const notificationId = req.params.id;
        const userId = req.user.id;
        const notification = await notification_service_1.default.markAsRead(notificationId, userId);
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
    static deleteNotification = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const notificationId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;
        await notification_service_1.default.deleteNotification(notificationId, userId, role);
        res.status(200).json({
            status: 'success',
            message: 'Notification deleted successfully.',
        });
    });
}
exports.NotificationController = NotificationController;
exports.default = NotificationController;
