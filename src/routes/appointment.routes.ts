import { Router } from 'express';
import { AppointmentController } from '../controllers/appointment.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateAppointmentBooking, validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Apply authentication middleware to all routes in this router
router.use(authenticateUser);

/**
 * @route   POST /api/appointments
 * @desc    Book a new appointment
 * @access  Private (Patients only)
 */
router.post(
  '/',
  authorizeRoles('patient'),
  validateAppointmentBooking,
  AppointmentController.bookAppointment
);

/**
 * @route   GET /api/appointments
 * @desc    Get appointments list (filtered by user role)
 * @access  Private (Patients, Doctors, Admins)
 */
router.get(
  '/',
  authorizeRoles('patient', 'doctor', 'admin'),
  AppointmentController.listAppointments
);

/**
 * @route   PATCH /api/appointments/:id/approve
 * @desc    Approve a pending appointment
 * @access  Private (Doctors only)
 */
router.patch(
  '/:id/approve',
  authorizeRoles('doctor'),
  validateRouteId('id'),
  AppointmentController.approveAppointment
);

/**
 * @route   PATCH /api/appointments/:id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Patients, Doctors, Admins)
 */
router.patch(
  '/:id/cancel',
  authorizeRoles('patient', 'doctor', 'admin'),
  validateRouteId('id'),
  AppointmentController.cancelAppointment
);

/**
 * @route   PATCH /api/appointments/:id/complete
 * @desc    Mark an appointment as completed
 * @access  Private (Doctors only)
 */
router.patch(
  '/:id/complete',
  authorizeRoles('doctor'),
  validateRouteId('id'),
  AppointmentController.completeAppointment
);

/**
 * @route   PATCH /api/appointments/:id/reschedule
 * @desc    Reschedule an appointment
 * @access  Private (Patients, Admins)
 */
router.patch(
  '/:id/reschedule',
  authorizeRoles('patient', 'admin'),
  validateRouteId('id'),
  AppointmentController.rescheduleAppointment
);

export default router;
