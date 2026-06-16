"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("../controllers/admin.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Protect all endpoints; restricted to authenticated Admins only
router.use(auth_middleware_1.authenticateUser);
router.use((0, auth_middleware_1.authorizeRoles)('admin'));
/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users with query filters
 * @access  Private (Admins only)
 */
router.get('/users', admin_controller_1.AdminController.listUsers);
/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Private (Admins only)
 */
router.patch('/users/:id/role', (0, validation_middleware_1.validateRouteId)('id'), admin_controller_1.AdminController.updateUserRole);
/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Suspend/activate user account
 * @access  Private (Admins only)
 */
router.patch('/users/:id/status', (0, validation_middleware_1.validateRouteId)('id'), admin_controller_1.AdminController.updateUserStatus);
/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account from registry
 * @access  Private (Admins only)
 */
router.delete('/users/:id', (0, validation_middleware_1.validateRouteId)('id'), admin_controller_1.AdminController.deleteUser);
/**
 * @route   GET /api/admin/stats
 * @desc    Get database counts and system metrics telemetry
 * @access  Private (Admins only)
 */
router.get('/stats', admin_controller_1.AdminController.getStats);
/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Broadcast a notification targeting all users or selected roles
 * @access  Private (Admins only)
 */
router.post('/notifications/broadcast', admin_controller_1.AdminController.broadcastNotification);
exports.default = router;
