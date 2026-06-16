"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const appointment_controller_1 = require("../controllers/appointment.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Apply authentication middleware to all routes in this router
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private (Patients only)
 */
router.post('/', (0, auth_middleware_1.authorizeRoles)('patient'), validation_middleware_1.validateAppointmentBooking, appointment_controller_1.AppointmentController.bookAppointment);
/**
 * @route   GET /api/appointments
 * @desc    Get appointments list (filtered by user role)
 * @access  Private (Patients, Doctors, Admins)
 */
router.get('/', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'admin'), appointment_controller_1.AppointmentController.listAppointments);
/**
 * @route   PATCH /api/appointments/:id/approve
 * @desc    Approve a pending appointment
 * @access  Private (Doctors only)
 */
router.patch('/:id/approve', (0, auth_middleware_1.authorizeRoles)('doctor'), (0, validation_middleware_1.validateRouteId)('id'), appointment_controller_1.AppointmentController.approveAppointment);
/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Patients, Doctors, Admins)
 */
router.patch('/:id/cancel', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), appointment_controller_1.AppointmentController.cancelAppointment);
/**
 * @route   PATCH /api/appointments/:id/complete
 * @desc    Mark an appointment as completed
 * @access  Private (Doctors only)
 */
router.patch('/:id/complete', (0, auth_middleware_1.authorizeRoles)('doctor'), (0, validation_middleware_1.validateRouteId)('id'), appointment_controller_1.AppointmentController.completeAppointment);
/**
 * @route   PATCH /api/appointments/:id/reschedule
 * @desc    Reschedule an appointment
 * @access  Private (Patients, Admins)
 */
router.patch('/:id/reschedule', (0, auth_middleware_1.authorizeRoles)('patient', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), appointment_controller_1.AppointmentController.rescheduleAppointment);
exports.default = router;
