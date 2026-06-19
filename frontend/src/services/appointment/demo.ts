import { IAppointmentService } from '../../core/interfaces/IAppointmentService';
import { Appointment } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';

const KEY = STORAGE.DEMO_DB.APPOINTMENTS;

function getAppointments(): Appointment[] {
  seedDemoDb();
  return getCollection<Appointment>(KEY);
}

export const demoAppointmentService: IAppointmentService = {
  async getAppointments(): Promise<Appointment[]> {
    await delay(600);
    return getAppointments();
  },

  async getAppointmentById(id: string): Promise<Appointment | undefined> {
    await delay(400);
    return getAppointments().find((a) => a.id === id);
  },

  async createAppointment(
    appointment: Omit<Appointment, 'id' | 'status'>
  ): Promise<Appointment> {
    await delay(900);
    const newAppt: Appointment = { ...appointment, id: `appt_${Date.now()}`, status: 'pending' };
    const list = getAppointments();
    list.unshift(newAppt);
    saveCollection(KEY, list);
    return newAppt;
  },

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    await delay(500);
    const list = getAppointments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    list[idx] = { ...list[idx], status };
    saveCollection(KEY, list);
    return list[idx];
  },

  async rescheduleAppointment(id: string, dateTime: string): Promise<Appointment> {
    await delay(500);
    const list = getAppointments();
    const idx = list.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Appointment not found');
    list[idx] = { ...list[idx], dateTime, status: 'pending' };
    saveCollection(KEY, list);
    return list[idx];
  },
};
