"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentService = void 0;
const appointment_model_1 = __importDefault(require("../models/appointment.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
const mongoose_1 = require("mongoose");
class AppointmentService {
    /**
     * Book a new appointment.
     */
    static async bookAppointment(patientId, doctorId, dateStr, time) {
        // 1. Verify that doctor user exists and holds the 'doctor' role
        const doctor = await user_model_1.default.findById(doctorId);
        if (!doctor || doctor.role !== 'doctor') {
            throw new errors_1.BadRequestError('The selected doctor was not found or is invalid.');
        }
        if (patientId === doctorId) {
            throw new errors_1.BadRequestError('Patients cannot book appointments with themselves.');
        }
        // 2. Parse appointment date
        const date = new Date(dateStr);
        // 3. Create the appointment in 'Pending' status
        const appointment = new appointment_model_1.default({
            patientId: new mongoose_1.Types.ObjectId(patientId),
            doctorId: new mongoose_1.Types.ObjectId(doctorId),
            date,
            time,
            status: 'Pending',
        });
        await appointment.save();
        return appointment;
    }
    /**
     * List appointments filtered based on the requester's role.
     */
    static async listAppointments(userId, role) {
        let filter = {};
        if (role === 'patient') {
            filter = { patientId: new mongoose_1.Types.ObjectId(userId) };
        }
        else if (role === 'doctor') {
            filter = { doctorId: new mongoose_1.Types.ObjectId(userId) };
        }
        else if (role === 'admin') {
            filter = {};
        }
        else {
            // Pharmacy, Hospital, etc., may not access appointments directly unless authorized
            throw new errors_1.ForbiddenError('You do not have permission to view appointments.');
        }
        return appointment_model_1.default.find(filter)
            .populate('patientId', 'name email role')
            .populate('doctorId', 'name email role')
            .sort({ date: 1, time: 1 });
    }
    /**
     * Approve a pending appointment (Doctors only).
     */
    static async approveAppointment(appointmentId, doctorId) {
        const appointment = await appointment_model_1.default.findById(appointmentId);
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found.');
        }
        // Security check: Only the doctor assigned to the appointment can approve it
        if (appointment.doctorId.toString() !== doctorId) {
            throw new errors_1.ForbiddenError('You are not authorized to approve this appointment.');
        }
        // Check current status
        if (appointment.status !== 'Pending') {
            throw new errors_1.BadRequestError(`Cannot approve appointment. Current status is '${appointment.status}'.`);
        }
        appointment.status = 'Approved';
        await appointment.save();
        return appointment;
    }
    /**
     * Cancel an appointment (Patients or Doctors or Admin).
     */
    static async cancelAppointment(appointmentId, userId, role) {
        const appointment = await appointment_model_1.default.findById(appointmentId);
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found.');
        }
        // Security check: Patients can cancel their own, Doctors can cancel their own, Admin can cancel any
        const isAssignedPatient = appointment.patientId.toString() === userId;
        const isAssignedDoctor = appointment.doctorId.toString() === userId;
        const isAdmin = role === 'admin';
        if (!isAssignedPatient && !isAssignedDoctor && !isAdmin) {
            throw new errors_1.ForbiddenError('You are not authorized to cancel this appointment.');
        }
        // Check status check: Cannot cancel if already completed or cancelled
        if (appointment.status === 'Completed') {
            throw new errors_1.BadRequestError('Cannot cancel an appointment that has already been completed.');
        }
        if (appointment.status === 'Cancelled') {
            throw new errors_1.BadRequestError('Appointment is already cancelled.');
        }
        appointment.status = 'Cancelled';
        await appointment.save();
        return appointment;
    }
    /**
     * Complete an appointment (Doctors only).
     */
    static async completeAppointment(appointmentId, doctorId) {
        const appointment = await appointment_model_1.default.findById(appointmentId);
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found.');
        }
        // Security check: Only the doctor assigned to the appointment can mark it completed
        if (appointment.doctorId.toString() !== doctorId) {
            throw new errors_1.ForbiddenError('You are not authorized to complete this appointment.');
        }
        // Can only complete approved appointments
        if (appointment.status !== 'Approved') {
            throw new errors_1.BadRequestError(`Cannot complete appointment unless it is in 'Approved' state. Current status is '${appointment.status}'.`);
        }
        appointment.status = 'Completed';
        await appointment.save();
        return appointment;
    }
    /**
     * Reschedule an appointment (Patients or Admin).
     */
    static async rescheduleAppointment(appointmentId, userId, role, dateTimeStr) {
        const appointment = await appointment_model_1.default.findById(appointmentId);
        if (!appointment) {
            throw new errors_1.NotFoundError('Appointment not found.');
        }
        // Security check: Only assigned patient or admin can reschedule
        if (appointment.patientId.toString() !== userId && role !== 'admin') {
            throw new errors_1.ForbiddenError('You are not authorized to reschedule this appointment.');
        }
        // Check status: Cannot reschedule if completed
        if (appointment.status === 'Completed') {
            throw new errors_1.BadRequestError('Cannot reschedule a completed appointment.');
        }
        const parsedDate = new Date(dateTimeStr);
        let timeStr = appointment.time;
        try {
            const hours = parsedDate.getHours();
            const minutes = parsedDate.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
            timeStr = `${formattedHours}:${formattedMinutes} ${ampm}`;
        }
        catch (e) {
            // ignore
        }
        appointment.date = parsedDate;
        appointment.time = timeStr;
        appointment.status = 'Pending';
        await appointment.save();
        return appointment;
    }
}
exports.AppointmentService = AppointmentService;
exports.default = AppointmentService;
