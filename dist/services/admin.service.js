"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const hospital_model_1 = __importDefault(require("../models/hospital.model"));
const medicine_model_1 = __importDefault(require("../models/medicine.model"));
const notification_model_1 = __importDefault(require("../models/notification.model"));
const prescription_model_1 = __importDefault(require("../models/prescription.model"));
const report_model_1 = __importDefault(require("../models/report.model"));
const errors_1 = require("../utils/errors");
const mongoose_1 = __importDefault(require("mongoose"));
const os_1 = __importDefault(require("os"));
class AdminService {
    /**
     * List all users with query filters.
     */
    static async listUsers(options) {
        const filter = {};
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
        return user_model_1.default.find(filter).sort({ name: 1 });
    }
    /**
     * Update a user's role.
     */
    static async updateUserRole(userId, role) {
        const validRoles = ['patient', 'doctor', 'hospital', 'pharmacy', 'admin'];
        if (!validRoles.includes(role)) {
            throw new errors_1.BadRequestError(`Invalid role selection. Role must be one of: ${validRoles.join(', ')}`);
        }
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found.');
        }
        user.role = role;
        await user.save();
        return user;
    }
    /**
     * Toggle a user's active status (suspend/activate).
     */
    static async updateUserStatus(userId, isActive) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found.');
        }
        user.isActive = isActive;
        await user.save();
        return user;
    }
    /**
     * Delete a user.
     */
    static async deleteUser(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found.');
        }
        await user_model_1.default.findByIdAndDelete(userId);
    }
    /**
     * Query database counts and system telemetry metrics.
     */
    static async getSystemStats() {
        const [totalUsers, totalAppointments, totalHospitals, totalMedicines, totalNotifications, totalPrescriptions, totalReports] = await Promise.all([
            user_model_1.default.countDocuments(),
            appointment_model_1.default.countDocuments(),
            hospital_model_1.default.countDocuments(),
            medicine_model_1.default.countDocuments(),
            notification_model_1.default.countDocuments(),
            prescription_model_1.default.countDocuments(),
            report_model_1.default.countDocuments()
        ]);
        // Role distributions
        const roleStats = await user_model_1.default.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        const roles = {
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
        const dbStateMap = {
            0: 'Disconnected',
            1: 'Connected',
            2: 'Connecting',
            3: 'Disconnecting'
        };
        const dbStatus = dbStateMap[mongoose_1.default.connection.readyState] || 'Unknown';
        // System metrics
        const totalMem = os_1.default.totalmem();
        const freeMem = os_1.default.freemem();
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
                cpuLoad: os_1.default.loadavg(),
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
    static async broadcastNotification(title, message, type, targetRole) {
        if (!title || !message) {
            throw new errors_1.BadRequestError('Notification title and message are required.');
        }
        const filter = { isActive: true };
        if (targetRole && targetRole !== 'all') {
            filter.role = targetRole;
        }
        const recipients = await user_model_1.default.find(filter).select('_id');
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
        await notification_model_1.default.insertMany(notificationsToCreate);
        return {
            sentCount: recipients.length
        };
    }
}
exports.AdminService = AdminService;
exports.default = AdminService;
