import { IAppointmentService } from '../../core/interfaces/IAppointmentService';
import { Appointment } from '../../types';
import apiClient from '../apiClient';

export const prodAppointmentService: IAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    const response = await apiClient.get('/appointments');
    return response.data?.data?.appointments || [];
  },

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data?.data?.appointment;
  },

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'status'>
  ): Promise<Appointment> {
    const response = await apiClient.post('/appointments', appointment);
    return response.data?.data?.appointment;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const suffix =
      status === 'approved' ? 'approve' : status === 'completed' ? 'complete' : 'cancel';
    const response = await apiClient.patch(`/appointments/${id}/${suffix}`);
    return response.data?.data?.appointment;
  },

  async rescheduleAppointment(id: string, dateTime: string): Promise<Appointment> {
    const response = await apiClient.patch(`/appointments/${id}/reschedule`, { dateTime });
    return response.data?.data?.appointment;
  },
};
