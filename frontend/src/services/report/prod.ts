import { IReportService } from '../../core/interfaces/IReportService';
import { MedicalReport } from '../../types';
import apiClient from '../apiClient';

export const prodReportService: IReportService = {
  async getReports(): Promise<MedicalReport[]> {
    const response = await apiClient.get('/reports');
    return response.data?.data?.reports || [];
  },

  async uploadReport(title: string, file: File): Promise<MedicalReport> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);
    const response = await apiClient.post('/reports/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data?.report;
  },

  async getParsedInsights(id: string): Promise<MedicalReport['parsedInsights'] | undefined> {
    const response = await apiClient.get(`/reports/${id}/insights`);
    return response.data?.data?.insights;
  },
};
