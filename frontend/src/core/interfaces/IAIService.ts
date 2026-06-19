export interface SymptomAnalysis {
  summary: string;
  possibleCauses: string[];
  riskLevel: 'Low' | 'Moderate' | 'Critical';
  recommendations: string[];
  suggestedTests: string[];
}

export interface ReportAnalysis {
  summary: string;
  keyMetrics: { name: string; value: string; status: 'Normal' | 'High' | 'Low' }[];
  findings: string[];
  recommendations: string[];
}

export interface HealthInsights {
  summary: string;
  lifestyleTips: string[];
  healthRisks: string[];
  followUps: string[];
}

export interface MedicineRecommendation {
  medicines: { name: string; genericName: string; dosage: string; frequency: string; reason: string }[];
  precautions: string[];
}

export interface RiskScore {
  score: number;
  level: 'Low' | 'Moderate' | 'High' | 'Critical';
  primaryRiskFactors: string[];
  details: string;
}

export interface DrugInteraction {
  severity: 'Low' | 'Moderate' | 'High';
  description: string;
  precautions: string[];
}

export interface IAIService {
  analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis>;
  analyzeMedicalReport(title: string, content: string): Promise<ReportAnalysis>;
  generateHealthInsights(patientHistory: unknown): Promise<HealthInsights>;
  recommendMedicines(symptoms: string, allergies: string[]): Promise<MedicineRecommendation>;
  calculateRiskScore(symptoms: string, vitals: unknown): Promise<RiskScore>;
  checkInteractions(med1: string, med2: string): Promise<DrugInteraction>;
}
