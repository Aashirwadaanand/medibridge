"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const notification_model_1 = __importDefault(require("../models/notification.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class NotificationService {
    /**
     * Create and send a new notification (Admins, Doctors, Hospitals only).
     */
    static async createNotification(recipientId, title, message, type) {
        // 1. Verify recipient user exists in database
        const user = await user_model_1.default.findById(recipientId);
        if (!user) {
            throw new errors_1.BadRequestError('The recipient user was not found.');
        }
        // 2. Create the notification document
        const notification = new notification_model_1.default({
            userId: new mongoose_1.Types.ObjectId(recipientId),
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
    static async listNotifications(userId, role) {
        let filter = {};
        // Standard users only see their own notifications. Admins can view all.
        if (role !== 'admin') {
            filter = { userId: new mongoose_1.Types.ObjectId(userId) };
        }
        return notification_model_1.default.find(filter)
            .populate('userId', 'name email role')
            .sort({ createdAt: -1 });
    }
    /**
     * Mark a notification as read (Enforces ownership).
     */
    static async markAsRead(notificationId, userId) {
        const notification = await notification_model_1.default.findById(notificationId);
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found.');
        }
        // Security check: Only the recipient can mark a notification as read
        if (notification.userId.toString() !== userId) {
            throw new errors_1.ForbiddenError('Access denied. You can only read your own notifications.');
        }
        notification.isRead = true;
        await notification.save();
        return notification;
    }
    /**
     * Delete a notification (Enforces ownership or Admin privileges).
     */
    static async deleteNotification(notificationId, userId, role) {
        const notification = await notification_model_1.default.findById(notificationId);
        if (!notification) {
            throw new errors_1.NotFoundError('Notification not found.');
        }
        // Security check: Only the recipient or an admin can delete
        const isOwner = notification.userId.toString() === userId;
        const isAdmin = role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new errors_1.ForbiddenError('Access denied. You can only delete your own notifications.');
        }
        await notification_model_1.default.findByIdAndDelete(notificationId);
    }
}
exports.NotificationService = NotificationService;
exports.default = NotificationService;
