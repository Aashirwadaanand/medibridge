import { IMedicineService } from '../../core/interfaces/IMedicineService';
import { Medicine } from '../../types';
import apiClient from '../apiClient';

export const prodMedicineService: IMedicineService = {
  async getMedicines(): Promise<Medicine[]> {
    const response = await apiClient.get('/medicines');
    return response.data?.data?.medicines || [];
  },

  async addMedicine(medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    const response = await apiClient.post('/medicines', medicine);
    return response.data?.data?.medicine;
  },

  async updateMedicineStock(id: string, stock: number): Promise<Medicine> {
    const response = await apiClient.patch(`/medicines/${id}/stock`, { stock });
    return response.data?.data?.medicine;
  },
};
