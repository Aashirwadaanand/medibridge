import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Protect all endpoints; restricted to authenticated Admins only
router.use(authenticateUser);
router.use(authorizeRoles('admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all registered users with query filters
 * @access  Private (Admins only)
 */
router.get('/users', AdminController.listUsers);

/**
 * @route   PATCH /api/admin/users/:id/role
 * @desc    Change user role
 * @access  Private (Admins only)
 */
router.patch('/users/:id/role', validateRouteId('id'), AdminController.updateUserRole);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Suspend/activate user account
 * @access  Private (Admins only)
 */
router.patch('/users/:id/status', validateRouteId('id'), AdminController.updateUserStatus);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete a user account from registry
 * @access  Private (Admins only)
 */
router.delete('/users/:id', validateRouteId('id'), AdminController.deleteUser);

/**
 * @route   GET /api/admin/stats
 * @desc    Get database counts and system metrics telemetry
 * @access  Private (Admins only)
 */
router.get('/stats', AdminController.getStats);

/**
 * @route   POST /api/admin/notifications/broadcast
 * @desc    Broadcast a notification targeting all users or selected roles
 * @access  Private (Admins only)
 */
router.post('/notifications/broadcast', AdminController.broadcastNotification);

export default router;
