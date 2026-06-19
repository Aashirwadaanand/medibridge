import { IPrescriptionService } from '../../core/interfaces/IPrescriptionService';
import { Prescription } from '../../types';
import apiClient from '../apiClient';

export const prodPrescriptionService: IPrescriptionService = {
  async getPrescriptions(): Promise<Prescription[]> {
    const response = await apiClient.get('/prescriptions');
    return response.data?.data?.prescriptions || [];
  },

  async createPrescription(
    prescription: Omit<Prescription, 'id' | 'date' | 'status'>
  ): Promise<Prescription> {
    const response = await apiClient.post('/prescriptions', prescription);
    return response.data?.data?.prescription;
  },
};
