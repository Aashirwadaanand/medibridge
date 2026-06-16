import { Request, Response } from 'express';
import AppointmentService from '../services/appointment.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

export class AppointmentController {
  /**
   * Book a new appointment.
   * POST /api/appointments
   */
  public static bookAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const { doctorId, date, time } = req.body;
    const patientId = req.user.id;

    const appointment = await AppointmentService.bookAppointment(patientId, doctorId, date, time);

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
  public static listAppointments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const appointments = await AppointmentService.listAppointments(req.user.id, req.user.role);

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
  public static approveAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const appointmentId = req.params.id;
    const doctorId = req.user.id;

    const appointment = await AppointmentService.approveAppointment(appointmentId, doctorId);

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
  public static cancelAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const appointmentId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const appointment = await AppointmentService.cancelAppointment(appointmentId, userId, role);

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
  public static completeAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const appointmentId = req.params.id;
    const doctorId = req.user.id;

    const appointment = await AppointmentService.completeAppointment(appointmentId, doctorId);

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
  public static rescheduleAppointment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const appointmentId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;
    const { dateTime } = req.body;

    if (!dateTime) {
      throw new BadRequestError('dateTime field is required to reschedule.');
    }

    const appointment = await AppointmentService.rescheduleAppointment(appointmentId, userId, role, dateTime);

    res.status(200).json({
      status: 'success',
      message: 'Appointment rescheduled successfully.',
      data: {
        appointment,
      },
    });
  });
}
export default AppointmentController;
