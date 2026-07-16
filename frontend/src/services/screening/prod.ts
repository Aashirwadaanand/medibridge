import { IScreeningService } from '../../core/interfaces/IScreeningService';
import { Screening } from '../../types';
import apiClient from '../apiClient';

export const prodScreeningService: IScreeningService = {
  async getScreenings(): Promise<Screening[]> {
    const response = await apiClient.get('/screenings');
    return response.data?.data?.screenings || [];
  },

  async getScreeningById(id: string): Promise<Screening> {
    const response = await apiClient.get(`/screenings/${id}`);
    return response.data?.data?.screening;
  },

  async createScreening(data: {
    patientId: string;
    patientName: string;
    screeningType: string;
    readings: {
      systolic?: number;
      diastolic?: number;
      bloodSugar?: number;
      bloodSugarType?: 'fasting' | 'random';
      hemoglobin?: number;
      tbSymptoms?: string[];
      isPregnant?: boolean;
      trimester?: number;
      ageGroup?: 'child' | 'adolescent' | 'adult';
      weight?: number;
      ifaStarted?: boolean;
    };
  }): Promise<Screening> {
    const response = await apiClient.post('/screenings', data);
    return response.data?.data?.screening;
  },

  async reviewScreening(
    id: string,
    data: {
      doctorNotes: string;
      actionTaken: string;
      followUpDate?: string;
    }
  ): Promise<Screening> {
    const response = await apiClient.put(`/screenings/${id}/review`, data);
    return response.data?.data?.screening;
  },

  async updateFollowUpStatus(
    id: string,
    status: 'pending' | 'completed' | 'none'
  ): Promise<Screening> {
    const response = await apiClient.put(`/screenings/${id}/followup`, { status });
    return response.data?.data?.screening;
  },
};
