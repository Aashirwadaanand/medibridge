import apiClient from './apiClient';
import { MedicalReport } from '../types';
import { mockReports, isDemoMode } from './mockData';

export const reportService = {
  async getReports(): Promise<MedicalReport[]> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([...mockReports]), 900);
      });
    }
    const response = await apiClient.get('/reports');
    return response.data?.data?.reports || [];
  },

  async uploadReport(title: string, _file: File): Promise<MedicalReport> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const newReport: MedicalReport = {
            id: `rep_${Date.now()}`,
            patientId: 'user_pat_01',
            patientName: 'Anshuman Das',
            title,
            uploadDate: new Date().toISOString(),
            status: 'processing'
          };
          mockReports.unshift(newReport);
          const stored = JSON.parse(localStorage.getItem('medibridge_demo_reports') || '[]');
          stored.unshift(newReport);
          localStorage.setItem('medibridge_demo_reports', JSON.stringify(stored));
          resolve(newReport);
        }, 1500);
      });
    }
    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', _file);
    const response = await apiClient.post('/reports/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data?.report;
  },

  async getParsedInsights(id: string): Promise<MedicalReport['parsedInsights'] | undefined> {
    if (isDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const report = mockReports.find(r => r.id === id);
          resolve(report?.parsedInsights);
        }, 400);
      });
    }
    const response = await apiClient.get(`/reports/${id}/insights`);
    return response.data?.data?.insights;
  }
};

export default reportService;
