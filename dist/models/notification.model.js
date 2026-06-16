"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notification = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for a notification recipient'],
    },
    title: {
        type: String,
        required: [true, 'Notification title is required'],
        trim: true,
        maxlength: [150, 'Notification title cannot exceed 150 characters'],
    },
    message: {
        type: String,
        required: [true, 'Notification message is required'],
        trim: true,
    },
    type: {
        type: String,
        enum: {
            values: ['appointment', 'medicine', 'prescription', 'followup', 'emergency', 'general'],
            message: '{VALUE} is not a valid notification type',
        },
        required: [true, 'Notification type is required'],
        default: 'general',
    },
    isRead: {
        type: Boolean,
        required: [true, 'Read status is required'],
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
    toObject: {
        transform: (_doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
// Index for fast lookup of notifications by user ID and creation date
notificationSchema.index({ userId: 1, createdAt: -1 });
exports.Notification = (0, mongoose_1.model)('Notification', notificationSchema);
exports.default = exports.Notification;
