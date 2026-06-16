"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentController = void 0;
const appointment_service_1 = __importDefault(require("../services/appointment.service"));
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class AppointmentController {
    /**
     * Book a new appointment.
     * POST /api/appointments
     */
    static bookAppointment = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const { doctorId, date, time } = req.body;
        const patientId = req.user.id;
        const appointment = await appointment_service_1.default.bookAppointment(patientId, doctorId, date, time);
        res.status(201).json({
            status: 'success',
            message: 'Appointment booked successfully.',
            data: {
                appointment,
            },
        });
    });
    /**
     * List appointments.
     * GET /api/appointments
     */
    static listAppointments = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const appointments = await appointment_service_1.default.listAppointments(req.user.id, req.user.role);
        res.status(200).json({
            status: 'success',
            results: appointments.length,
            data: {
                appointments,
            },
        });
    });
    /**
     * Approve an appointment (Doctors only).
     * PATCH /api/appointments/:id/approve
     */
    static approveAppointment = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const appointmentId = req.params.id;
        const doctorId = req.user.id;
        const appointment = await appointment_service_1.default.approveAppointment(appointmentId, doctorId);
        res.status(200).json({
            status: 'success',
            message: 'Appointment approved successfully.',
            data: {
                appointment,
            },
        });
    });
    /**
     * Cancel an appointment.
     * PATCH /api/appointments/:id/cancel
     */
    static cancelAppointment = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const appointmentId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;
        const appointment = await appointment_service_1.default.cancelAppointment(appointmentId, userId, role);
        res.status(200).json({
            status: 'success',
            message: 'Appointment cancelled successfully.',
            data: {
                appointment,
            },
        });
    });
    /**
     * Mark an appointment as completed (Doctors only).
     * PATCH /api/appointments/:id/complete
     */
    static completeAppointment = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const appointmentId = req.params.id;
        const doctorId = req.user.id;
        const appointment = await appointment_service_1.default.completeAppointment(appointmentId, doctorId);
        res.status(200).json({
            status: 'success',
            message: 'Appointment marked as completed.',
            data: {
                appointment,
            },
        });
    });
    /**
     * Reschedule an appointment.
     * PATCH /api/appointments/:id/reschedule
     */
    static rescheduleAppointment = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const appointmentId = req.params.id;
        const userId = req.user.id;
        const role = req.user.role;
        const { dateTime } = req.body;
        if (!dateTime) {
            throw new errors_1.BadRequestError('dateTime field is required to reschedule.');
        }
        const appointment = await appointment_service_1.default.rescheduleAppointment(appointmentId, userId, role, dateTime);
        res.status(200).json({
            status: 'success',
            message: 'Appointment rescheduled successfully.',
            data: {
                appointment,
            },
        });
    });
}
exports.AppointmentController = AppointmentController;
exports.default = AppointmentController;
