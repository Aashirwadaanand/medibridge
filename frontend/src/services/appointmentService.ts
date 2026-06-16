import apiClient from './apiClient';
import { Appointment } from '../types';
import { mockAppointments, isDemoMode } from './mockData';

export const appointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockAppointments]), 800);
      });
    }
    const response = await apiClient.get('/appointments');
    return response.data?.data?.appointments || [];
  },

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(mockAppointments.find(a => a.id === id));
        }, 500);
      });
    }
    const response = await apiClient.get(`/appointments/${id}`);
    return response.data?.data?.appointment;
  },

  async createAppointment(appointment: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newAppt: Appointment = {
            ...appointment,
            id: `appt_${Date.now()}`,
            status: 'pending'
          };
          mockAppointments.unshift(newAppt);
          const stored = JSON.parse(localStorage.getItem('medibridge_demo_appointments') || '[]');
          stored.unshift(newAppt);
          localStorage.setItem('medibridge_demo_appointments', JSON.stringify(stored));
          resolve(newAppt);
        }, 1000);
      });
    }
    const response = await apiClient.post('/appointments', appointment);
    return response.data?.data?.appointment;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const appt = mockAppointments.find(a => a.id === id);
          if (appt) {
            appt.status = status;
            const stored = JSON.parse(localStorage.getItem('medibridge_demo_appointments') || '[]');
            const idx = stored.findIndex((a: any) => a.id === id);
            if (idx > -1) {
              stored[idx].status = status;
              localStorage.setItem('medibridge_demo_appointments', JSON.stringify(stored));
            }
            resolve({ ...appt });
          } else {
            reject(new Error('Appointment not found'));
          }
        }, 600);
      });
    }
    const suffix = status === 'approved' ? 'approve' : status === 'completed' ? 'complete' : 'cancel';
    const response = await apiClient.patch(`/appointments/${id}/${suffix}`);
    return response.data?.data?.appointment;
  },

  async rescheduleAppointment(id: string, dateTime: string): Promise<Appointment> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const appt = mockAppointments.find(a => a.id === id);
          if (appt) {
            appt.dateTime = dateTime;
            appt.status = 'pending';
            const stored = JSON.parse(localStorage.getItem('medibridge_demo_appointments') || '[]');
            const idx = stored.findIndex((a: any) => a.id === id);
            if (idx > -1) {
              stored[idx].dateTime = dateTime;
              stored[idx].status = 'pending';
              localStorage.setItem('medibridge_demo_appointments', JSON.stringify(stored));
            }
            resolve({ ...appt });
          } else {
            reject(new Error('Appointment not found'));
          }
        }, 600);
      });
    }
    const response = await apiClient.patch(`/appointments/${id}/reschedule`, { dateTime });
    return response.data?.data?.appointment;
  }
};

export default appointmentService;
