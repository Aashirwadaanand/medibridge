import apiClient from './apiClient';
import { Medicine } from '../types';
import { mockMedicines, isDemoMode } from './mockData';

export const medicineService = {
  async getMedicines(): Promise<Medicine[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockMedicines]), 600);
      });
    }
    const response = await apiClient.get('/medicines');
    return response.data?.data?.medicines || [];
  },

  async addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newMed: Medicine = {
            ...medicine,
            id: `med_${Date.now()}`
          };
          mockMedicines.push(newMed);
          const stored = JSON.parse(localStorage.getItem('medibridge_demo_medicines') || '[]');
          stored.push(newMed);
          localStorage.setItem('medibridge_demo_medicines', JSON.stringify(stored));
          resolve(newMed);
        }, 800);
      });
    }
    const response = await apiClient.post('/medicines', medicine);
    return response.data?.data?.medicine;
  },

  async updateMedicineStock(id: string, stock: number): Promise<Medicine> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const med = mockMedicines.find(m => m.id === id);
          if (med) {
            med.stock = stock;
            const stored = JSON.parse(localStorage.getItem('medibridge_demo_medicines') || '[]');
            const idx = stored.findIndex((m: any) => m.id === id);
            if (idx > -1) {
              stored[idx].stock = stock;
              localStorage.setItem('medibridge_demo_medicines', JSON.stringify(stored));
            }
            resolve({ ...med });
          } else {
            reject(new Error('Medicine not found'));
          }
        }, 500);
      });
    }
    const response = await apiClient.patch(`/medicines/${id}/stock`, { stock });
    return response.data?.data?.medicine;
  }
};

export default medicineService;
