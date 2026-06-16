import apiClient from './apiClient';
import { Prescription } from '../types';
import { mockPrescriptions, isDemoMode } from './mockData';

export const prescriptionService = {
  async getPrescriptions(): Promise<Prescription[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockPrescriptions]), 800);
      });
    }
    const response = await apiClient.get('/prescriptions');
    return response.data?.data?.prescriptions || [];
  },

  async createPrescription(prescription: Omit<Prescription, 'id' | 'date' | 'status'>): Promise<Prescription> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newPres: Prescription = {
            ...prescription,
            id: `pres_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            status: 'active'
          };
          mockPrescriptions.unshift(newPres);
          const stored = JSON.parse(localStorage.getItem('medibridge_demo_prescriptions') || '[]');
          stored.unshift(newPres);
          localStorage.setItem('medibridge_demo_prescriptions', JSON.stringify(stored));
          resolve(newPres);
        }, 900);
      });
    }
    const response = await apiClient.post('/prescriptions', prescription);
    return response.data?.data?.prescription;
  }
};

export default prescriptionService;
