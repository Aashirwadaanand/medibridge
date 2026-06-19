import {
  IAIService, SymptomAnalysis, ReportAnalysis,
  HealthInsights, MedicineRecommendation, RiskScore, DrugInteraction
} from '../../core/interfaces/IAIService';
import apiClient from '../apiClient';

export const prodAIService: IAIService = {
  async analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis> {
    const response = await apiClient.post('/ai/analyze-symptoms', { symptoms });
    return response.data?.data;
  },
  async analyzeMedicalReport(title: string, content: string): Promise<ReportAnalysis> {
    const response = await apiClient.post('/ai/analyze-report', { title, content });
    return response.data?.data;
  },
  async generateHealthInsights(patientHistory: unknown): Promise<HealthInsights> {
    const response = await apiClient.post('/ai/health-insights', { patientHistory });
    return response.data?.data;
  },
  async recommendMedicines(symptoms: string, allergies: string[]): Promise<MedicineRecommendation> {
    const response = await apiClient.post('/ai/recommend-medicines', { symptoms, allergies });
    return response.data?.data;
  },
  async calculateRiskScore(symptoms: string, vitals: unknown): Promise<RiskScore> {
    const response = await apiClient.post('/ai/risk-score', { symptoms, vitals });
    return response.data?.data;
  },
  async checkInteractions(med1: string, med2: string): Promise<DrugInteraction> {
    const response = await apiClient.post('/ai/check-interactions', { med1, med2 });
    return response.data?.data;
  },
};
