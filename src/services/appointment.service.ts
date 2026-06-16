import Appointment from '../models/appointment.model';
import User from '../models/user.model';
import { IAppointment } from '../types/appointment.interface';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { Types } from 'mongoose';

export class AppointmentService {
  /**
   * Book a new appointment.
   */
  public static async bookAppointment(
    patientId: string,
    doctorId: string,
    dateStr: string,
    time: string
  ): Promise<IAppointment> {
    // 1. Verify that doctor user exists and holds the 'doctor' role
    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      throw new BadRequestError('The selected doctor was not found or is invalid.');
    }

    if (patientId === doctorId) {
      throw new BadRequestError('Patients cannot book appointments with themselves.');
    }

    // 2. Parse appointment date
    const date = new Date(dateStr);

    // 3. Create the appointment in 'Pending' status
    const appointment = new Appointment({
      patientId: new Types.ObjectId(patientId),
      doctorId: new Types.ObjectId(doctorId),
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
  public static async listAppointments(userId: string, role: string): Promise<IAppointment[]> {
    let filter = {};

    if (role === 'patient') {
      filter = { patientId: new Types.ObjectId(userId) };
    } else if (role === 'doctor') {
      filter = { doctorId: new Types.ObjectId(userId) };
    } else if (role === 'admin') {
      filter = {};
    } else {
      // Pharmacy, Hospital, etc., may not access appointments directly unless authorized
      throw new ForbiddenError('You do not have permission to view appointments.');
    }

    return Appointment.find(filter)
      .populate('patientId', 'name email role')
      .populate('doctorId', 'name email role')
      .sort({ date: 1, time: 1 });
  }

  /**
   * Approve a pending appointment (Doctors only).
   */
  public static async approveAppointment(appointmentId: string, doctorId: string): Promise<IAppointment> {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    // Security check: Only the doctor assigned to the appointment can approve it
    if (appointment.doctorId.toString() !== doctorId) {
      throw new ForbiddenError('You are not authorized to approve this appointment.');
    }

    // Check current status
    if (appointment.status !== 'Pending') {
      throw new BadRequestError(`Cannot approve appointment. Current status is '${appointment.status}'.`);
    }

    appointment.status = 'Approved';
    await appointment.save();

    return appointment;
  }

  /**
   * Cancel an appointment (Patients or Doctors or Admin).
   */
  public static async cancelAppointment(
    appointmentId: string,
    userId: string,
    role: string
  ): Promise<IAppointment> {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    // Security check: Patients can cancel their own, Doctors can cancel their own, Admin can cancel any
    const isAssignedPatient = appointment.patientId.toString() === userId;
    const isAssignedDoctor = appointment.doctorId.toString() === userId;
    const isAdmin = role === 'admin';

    if (!isAssignedPatient && !isAssignedDoctor && !isAdmin) {
      throw new ForbiddenError('You are not authorized to cancel this appointment.');
    }

    // Check status check: Cannot cancel if already completed or cancelled
    if (appointment.status === 'Completed') {
      throw new BadRequestError('Cannot cancel an appointment that has already been completed.');
    }

    if (appointment.status === 'Cancelled') {
      throw new BadRequestError('Appointment is already cancelled.');
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    return appointment;
  }

  /**
   * Complete an appointment (Doctors only).
   */
  public static async completeAppointment(appointmentId: string, doctorId: string): Promise<IAppointment> {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    // Security check: Only the doctor assigned to the appointment can mark it completed
    if (appointment.doctorId.toString() !== doctorId) {
      throw new ForbiddenError('You are not authorized to complete this appointment.');
    }

    // Can only complete approved appointments
    if (appointment.status !== 'Approved') {
      throw new BadRequestError(`Cannot complete appointment unless it is in 'Approved' state. Current status is '${appointment.status}'.`);
    }

    appointment.status = 'Completed';
    await appointment.save();

    return appointment;
  }

  /**
   * Reschedule an appointment (Patients or Admin).
   */
  public static async rescheduleAppointment(
    appointmentId: string,
    userId: string,
    role: string,
    dateTimeStr: string
  ): Promise<IAppointment> {
    const appointment = await Appointment.findById(appointmentId);

    if (!appointment) {
      throw new NotFoundError('Appointment not found.');
    }

    // Security check: Only assigned patient or admin can reschedule
    if (appointment.patientId.toString() !== userId && role !== 'admin') {
      throw new ForbiddenError('You are not authorized to reschedule this appointment.');
    }

    // Check status: Cannot reschedule if completed
    if (appointment.status === 'Completed') {
      throw new BadRequestError('Cannot reschedule a completed appointment.');
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
    } catch (e) {
      // ignore
    }

    appointment.date = parsedDate;
    appointment.time = timeStr;
    appointment.status = 'Pending';
    await appointment.save();

    return appointment;
  }
}
export default AppointmentService;
