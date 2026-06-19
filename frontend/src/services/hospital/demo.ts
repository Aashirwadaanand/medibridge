import { IHospitalService } from '../../core/interfaces/IHospitalService';
import { Hospital } from '../../types';
import { delay, STORAGE } from '../../config/appMode';
import { getCollection, saveCollection, seedDemoDb } from '../_demoDb';

const KEY = STORAGE.DEMO_DB.HOSPITALS;

function getHospitals(): Hospital[] {
  seedDemoDb();
  return getCollection<Hospital>(KEY);
}

export const demoHospitalService: IHospitalService = {
  async getHospitals(): Promise<Hospital[]> {
    await delay(600);
    return getHospitals();
  },

  async updateHospitalBeds(id: string, bedsAvailable: number): Promise<Hospital> {
    await delay(500);
    const list = getHospitals();
    const idx = list.findIndex((h) => h.id === id);
    if (idx === -1) throw new Error('Hospital not found');
    list[idx] = { ...list[idx], bedsAvailable };
    saveCollection(KEY, list);
    return list[idx];
  },
};
