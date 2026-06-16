import apiClient from './apiClient';

export const aiService = {
  /**
   * Analyze patient symptoms
   */
  async analyzeSymptoms(symptoms: string): Promise<{
    summary: string;
    possibleCauses: string[];
    riskLevel: 'Low' | 'Moderate' | 'Critical';
    recommendations: string[];
    suggestedTests: string[];
  }> {
    const response = await apiClient.post('/ai/analyze-symptoms', { symptoms });
    return response.data?.data;
  },

  /**
   * Analyze clinical medical report details
   */
  async analyzeMedicalReport(title: string, content: string): Promise<{
    summary: string;
    keyMetrics: { name: string; value: string; status: 'Normal' | 'High' | 'Low' }[];
    findings: string[];
    recommendations: string[];
  }> {
    const response = await apiClient.post('/ai/analyze-report', { title, content });
    return response.data?.data;
  },

  /**
   * Generate personalized patient health insights
   */
  async generateHealthInsights(patientHistory: any): Promise<{
    summary: string;
    lifestyleTips: string[];
    healthRisks: string[];
    followUps: string[];
  }> {
    const response = await apiClient.post('/ai/health-insights', { patientHistory });
    return response.data?.data;
  },

  /**
   * Recommend medicines avoiding specified allergies
   */
  async recommendMedicines(symptoms: string, allergies: string[]): Promise<{
    medicines: { name: string; genericName: string; dosage: string; frequency: string; reason: string }[];
    precautions: string[];
  }> {
    const response = await apiClient.post('/ai/recommend-medicines', { symptoms, allergies });
    return response.data?.data;
  },

  /**
   * Calculate triage clinical risk score
   */
  async calculateRiskScore(symptoms: string, vitals: any): Promise<{
    score: number;
    level: 'Low' | 'Moderate' | 'High' | 'Critical';
    primaryRiskFactors: string[];
    details: string;
  }> {
    const response = await apiClient.post('/ai/risk-score', { symptoms, vitals });
    return response.data?.data;
  },

  /**
   * Check drug-to-drug interactions
   */
  async checkInteractions(med1: string, med2: string): Promise<{
    severity: 'Low' | 'Moderate' | 'High';
    description: string;
    precautions: string[];
  }> {
    const response = await apiClient.post('/ai/check-interactions', { med1, med2 });
    return response.data?.data;
  }
};

export default aiService;
