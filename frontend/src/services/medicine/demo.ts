import { IMedicineService } from '../../core/interfaces/IMedicineService';
import { Medicine } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';

const KEY = STORAGE.DEMO_DB.MEDICINES;

function getMedicines(): Medicine[] {
  seedDemoDb();
  return getCollection<Medicine>(KEY);
}

export const demoMedicineService: IMedicineService = {
  async getMedicines(): Promise<Medicine[]> {
    await delay(500);
    return getMedicines();
  },

  async addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    await delay(800);
    const newMed: Medicine = { ...medicine, id: `med_${Date.now()}` };
    const list = getMedicines();
    list.push(newMed);
    saveCollection(KEY, list);
    return newMed;
  },

  async updateMedicineStock(id: string, stock: number): Promise<Medicine> {
    await delay(400);
    const list = getMedicines();
    const idx = list.findIndex((m) => m.id === id);
    if (idx === -1) throw new Error('Medicine not found');
    list[idx] = { ...list[idx], stock };
    saveCollection(KEY, list);
    return list[idx];
  },
};
