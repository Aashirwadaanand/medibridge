import User from '../models/user.model';
import Appointment from '../models/appointment.model';
import Hospital from '../models/hospital.model';
import Medicine from '../models/medicine.model';
import Notification from '../models/notification.model';
import Prescription from '../models/prescription.model';
import Report from '../models/report.model';
import { IUser } from '../types/user.interface';
import { NotFoundError, BadRequestError } from '../utils/errors';
import mongoose from 'mongoose';
import os from 'os';

export class AdminService {
  /**
   * List all users with query filters.
   */
  public static async listUsers(options: {
    search?: string;
    role?: string;
    isActive?: boolean;
  }): Promise<IUser[]> {
    const filter: any = {};

    if (options.role) {
      filter.role = options.role;
    }

    if (options.isActive !== undefined) {
      filter.isActive = options.isActive;
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    return User.find(filter).sort({ name: 1 });
  }

  /**
   * Update a user's role.
   */
  public static async updateUserRole(userId: string, role: string): Promise<IUser> {
    const validRoles = ['patient', 'doctor', 'hospital', 'pharmacy', 'admin'];
    if (!validRoles.includes(role)) {
      throw new BadRequestError(`Invalid role selection. Role must be one of: ${validRoles.join(', ')}`);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    user.role = role as any;
    await user.save();
    return user;
  }

  /**
   * Toggle a user's active status (suspend/activate).
   */
  public static async updateUserStatus(userId: string, isActive: boolean): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    user.isActive = isActive;
    await user.save();
    return user;
  }

  /**
   * Delete a user.
   */
  public static async deleteUser(userId: string): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    await User.findByIdAndDelete(userId);
  }

  /**
   * Query database counts and system telemetry metrics.
   */
  public static async getSystemStats(): Promise<any> {
    const [
      totalUsers,
      totalAppointments,
      totalHospitals,
      totalMedicines,
      totalNotifications,
      totalPrescriptions,
      totalReports
    ] = await Promise.all([
      User.countDocuments(),
      Appointment.countDocuments(),
      Hospital.countDocuments(),
      Medicine.countDocuments(),
      Notification.countDocuments(),
      Prescription.countDocuments(),
      Report.countDocuments()
    ]);

    // Role distributions
    const roleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    const roles: Record<string, number> = {
      patient: 0,
      doctor: 0,
      hospital: 0,
      pharmacy: 0,
      admin: 0
    };
    roleStats.forEach(item => {
      if (item._id) {
        roles[item._id] = item.count;
      }
    });

    // Mongoose DB status
    const dbStateMap: Record<number, string> = {
      0: 'Disconnected',
      1: 'Connected',
      2: 'Connecting',
      3: 'Disconnecting'
    };
    const dbStatus = dbStateMap[mongoose.connection.readyState] || 'Unknown';

    // System metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsagePercent = Math.round(((totalMem - freeMem) / totalMem) * 100);

    return {
      db: {
        status: dbStatus,
        collections: {
          users: totalUsers,
          appointments: totalAppointments,
          hospitals: totalHospitals,
          medicines: totalMedicines,
          notifications: totalNotifications,
          prescriptions: totalPrescriptions,
          reports: totalReports
        }
      },
      system: {
        uptime: process.uptime(),
        memory: {
          total: totalMem,
          free: freeMem,
          usagePercentage: memUsagePercent
        },
        cpuLoad: os.loadavg(),
        activeSessions: totalUsers > 0 ? Math.round(totalUsers * 0.15) + 3 : 0 // Simulated active sessions from DB
      },
      users: {
        total: totalUsers,
        roles
      }
    };
  }

  /**
   * Broadcast a notification to users.
   */
  public static async broadcastNotification(
    title: string,
    message: string,
    type: 'appointment' | 'medicine' | 'prescription' | 'followup' | 'emergency' | 'general',
    targetRole?: string
  ): Promise<any> {
    if (!title || !message) {
      throw new BadRequestError('Notification title and message are required.');
    }

    const filter: any = { isActive: true };
    if (targetRole && targetRole !== 'all') {
      filter.role = targetRole;
    }

    const recipients = await User.find(filter).select('_id');
    if (recipients.length === 0) {
      return { sentCount: 0 };
    }

    const notificationsToCreate = recipients.map(user => ({
      userId: user._id,
      title,
      message,
      type,
      isRead: false
    }));

    await Notification.insertMany(notificationsToCreate);

    return {
      sentCount: recipients.length
    };
  }
}

export default AdminService;
