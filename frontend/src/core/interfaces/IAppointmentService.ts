import { Appointment } from '../../types';

export interface IAppointmentService {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentById(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment>;
  updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment>;
  rescheduleAppointment(id: string, dateTime: string): Promise<Appointment>;
}
