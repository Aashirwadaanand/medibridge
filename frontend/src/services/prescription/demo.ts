import { IPrescriptionService } from '../../core/interfaces/IPrescriptionService';
import { Prescription } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';

const KEY = STORAGE.DEMO_DB.PRESCRIPTIONS;

function getPrescriptions(): Prescription[] {
  seedDemoDb();
  return getCollection<Prescription>(KEY);
}

export const demoPrescriptionService: IPrescriptionService = {
  async getPrescriptions(): Promise<Prescription[]> {
    await delay(700);
    return getPrescriptions();
  },

  async createPrescription(
    prescription: Omit<Prescription, 'id' | 'date' | 'status'>
  ): Promise<Prescription> {
    await delay(900);
    const newPres: Prescription = {
      ...prescription,
      id: `pres_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'active',
    };
    const list = getPrescriptions();
    list.unshift(newPres);
    saveCollection(KEY, list);
    return newPres;
  },
};
