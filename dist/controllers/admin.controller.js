"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = __importDefault(require("../services/admin.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class AdminController {
    /**
     * List all registered users
     * GET /api/admin/users
     */
    static listUsers = (0, asyncHandler_1.default)(async (req, res) => {
        const { search, role, isActive } = req.query;
        let parsedActive = undefined;
        if (isActive !== undefined) {
            parsedActive = isActive === 'true';
        }
        const users = await admin_service_1.default.listUsers({
            search: search,
            role: role,
            isActive: parsedActive
        });
        res.status(200).json({
            status: 'success',
            results: users.length,
            data: {
                users
            }
        });
    });
    /**
     * Update a user's role
     * PATCH /api/admin/users/:id/role
     */
    static updateUserRole = (0, asyncHandler_1.default)(async (req, res) => {
        const userId = req.params.id;
        const { role } = req.body;
        if (!role) {
            throw new errors_1.BadRequestError('User role is required.');
        }
        const user = await admin_service_1.default.updateUserRole(userId, role);
        res.status(200).json({
            status: 'success',
            message: 'User role updated successfully.',
            data: {
                user
            }
        });
    });
    /**
     * Toggle a user's active status (suspend/activate)
     * PATCH /api/admin/users/:id/status
     */
    static updateUserStatus = (0, asyncHandler_1.default)(async (req, res) => {
        const userId = req.params.id;
        const { isActive } = req.body;
        if (isActive === undefined) {
            throw new errors_1.BadRequestError('Active status (isActive) is required.');
        }
        const user = await admin_service_1.default.updateUserStatus(userId, isActive);
        res.status(200).json({
            status: 'success',
            message: isActive ? 'User account activated successfully.' : 'User account suspended successfully.',
            data: {
                user
            }
        });
    });
    /**
     * Delete a user account
     * DELETE /api/admin/users/:id
     */
    static deleteUser = (0, asyncHandler_1.default)(async (req, res) => {
        const userId = req.params.id;
        await admin_service_1.default.deleteUser(userId);
        res.status(200).json({
            status: 'success',
            message: 'User account deleted successfully.'
        });
    });
    /**
     * Fetch database counts and system statistics
     * GET /api/admin/stats
     */
    static getStats = (0, asyncHandler_1.default)(async (_req, res) => {
        const stats = await admin_service_1.default.getSystemStats();
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        });
    });
    /**
     * Broadcast a notification to users
     * POST /api/admin/notifications/broadcast
     */
    static broadcastNotification = (0, asyncHandler_1.default)(async (req, res) => {
        const { title, message, type, targetRole } = req.body;
        if (!title || !message) {
            throw new errors_1.BadRequestError('Notification title and message are required.');
        }
        const result = await admin_service_1.default.broadcastNotification(title, message, type || 'general', targetRole);
        res.status(200).json({
            status: 'success',
            message: `Broadcast sent successfully to ${result.sentCount} recipients.`,
            data: {
                sentCount: result.sentCount
            }
        });
    });
}
exports.AdminController = AdminController;
exports.default = AdminController;
