import { Medicine } from '../../types';

export interface IMedicineService {
  getMedicines(): Promise<Medicine[]>;
  addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine>;
  updateMedicineStock(id: string, stock: number): Promise<Medicine>;
}
