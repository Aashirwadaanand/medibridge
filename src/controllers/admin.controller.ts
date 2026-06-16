import { Request, Response } from 'express';
import AdminService from '../services/admin.service';
import asyncHandler from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

export class AdminController {
  /**
   * List all registered users
   * GET /api/admin/users
   */
  public static listUsers = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { search, role, isActive } = req.query;

    let parsedActive: boolean | undefined = undefined;
    if (isActive !== undefined) {
      parsedActive = isActive === 'true';
    }

    const users = await AdminService.listUsers({
      search: search as string,
      role: role as string,
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
  public static updateUserRole = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    const { role } = req.body;

    if (!role) {
      throw new BadRequestError('User role is required.');
    }

    const user = await AdminService.updateUserRole(userId, role);

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
  public static updateUserStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;
    const { isActive } = req.body;

    if (isActive === undefined) {
      throw new BadRequestError('Active status (isActive) is required.');
    }

    const user = await AdminService.updateUserStatus(userId, isActive);

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
  public static deleteUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const userId = req.params.id;

    await AdminService.deleteUser(userId);

    res.status(200).json({
      status: 'success',
      message: 'User account deleted successfully.'
    });
  });

  /**
   * Fetch database counts and system statistics
   * GET /api/admin/stats
   */
  public static getStats = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const stats = await AdminService.getSystemStats();

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
  public static broadcastNotification = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, message, type, targetRole } = req.body;

    if (!title || !message) {
      throw new BadRequestError('Notification title and message are required.');
    }

    const result = await AdminService.broadcastNotification(title, message, type || 'general', targetRole);

    res.status(200).json({
      status: 'success',
      message: `Broadcast sent successfully to ${result.sentCount} recipients.`,
      data: {
        sentCount: result.sentCount
      }
    });
  });
}

export default AdminController;
