import apiClient from './apiClient';
import { Hospital } from '../types';
import { mockHospitals, isDemoMode } from './mockData';

export const hospitalService = {
  async getHospitals(): Promise<Hospital[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockHospitals]), 700);
      });
    }
    const response = await apiClient.get('/hospitals');
    return response.data?.data?.hospitals || [];
  },

  async updateHospitalBeds(id: string, bedsAvailable: number): Promise<Hospital> {
    if (isDemoMode()) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const hosp = mockHospitals.find(h => h.id === id);
          if (hosp) {
            hosp.bedsAvailable = bedsAvailable;
            const stored = JSON.parse(localStorage.getItem('medibridge_demo_hospitals') || '[]');
            const idx = stored.findIndex((h: any) => h.id === id);
            if (idx > -1) {
              stored[idx].bedsAvailable = bedsAvailable;
              localStorage.setItem('medibridge_demo_hospitals', JSON.stringify(stored));
            }
            resolve({ ...hosp });
          } else {
            reject(new Error('Hospital not found'));
          }
        }, 500);
      });
    }
    const response = await apiClient.patch(`/hospitals/${id}/beds`, { bedsAvailable });
    return response.data?.data?.hospital;
  }
};

export default hospitalService;
