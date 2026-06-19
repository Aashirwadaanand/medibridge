import { IHospitalService } from '../../core/interfaces/IHospitalService';
import { Hospital } from '../../types';
import apiClient from '../apiClient';

export const prodHospitalService: IHospitalService = {
  async getHospitals(): Promise<Hospital[]> {
    const response = await apiClient.get('/hospitals');
    return response.data?.data?.hospitals || [];
  },

  async updateHospitalBeds(id: string, bedsAvailable: number): Promise<Hospital> {
    const response = await apiClient.patch(`/hospitals/${id}/beds`, { bedsAvailable });
    return response.data?.data?.hospital;
  },
};
