/**
 * services/ai/demo.ts
 *
 * Demo AI service — returns hardcoded but realistic responses.
 * Simulates a 2-second AI processing delay for authenticity.
 */
import {
  IAIService, SymptomAnalysis, ReportAnalysis,
  HealthInsights, MedicineRecommendation, RiskScore, DrugInteraction
} from '../../core/interfaces/IAIService';
import { delay } from '../../config/appMode';

export const demoAIService: IAIService = {
  async analyzeSymptoms(symptoms: string): Promise<SymptomAnalysis> {
    await delay(2000);
    return {
      summary: `Based on the reported symptoms (${symptoms.substring(0, 50)}...), the presentation is consistent with a cardiovascular-related condition requiring immediate monitoring and lifestyle evaluation.`,
      possibleCauses: [
        'Hypertension (primary suspect based on symptom cluster)',
        'Cardiac arrhythmia — requires ECG confirmation',
        'Anxiety-induced tachycardia',
        'Thyroid dysfunction (secondary possibility)',
      ],
      riskLevel: 'Moderate',
      recommendations: [
        'Schedule an urgent consultation with a cardiologist within 48 hours.',
        'Monitor blood pressure every 6 hours for the next 72 hours.',
        'Avoid strenuous physical activity and high-sodium foods.',
        'Increase fluid intake to 2.5L per day unless contraindicated.',
      ],
      suggestedTests: [
        '12-Lead Electrocardiogram (ECG)',
        'Complete Blood Count (CBC)',
        'Thyroid Stimulating Hormone (TSH)',
        'Serum Electrolytes Panel',
      ],
    };
  },

  async analyzeMedicalReport(title: string, _content: string): Promise<ReportAnalysis> {
    await delay(2000);
    return {
      summary: `Analysis of "${title}" indicates several parameters outside the recommended clinical range. Early intervention is advised to prevent progression.`,
      keyMetrics: [
        { name: 'LDL Cholesterol', value: '145 mg/dL', status: 'High' },
        { name: 'HDL Cholesterol', value: '52 mg/dL', status: 'Normal' },
        { name: 'Total Cholesterol', value: '218 mg/dL', status: 'High' },
        { name: 'Triglycerides', value: '140 mg/dL', status: 'Normal' },
        { name: 'Blood Glucose (Fasting)', value: '98 mg/dL', status: 'Normal' },
      ],
      findings: [
        'LDL cholesterol exceeds target for cardiovascular risk patients (<100 mg/dL).',
        'Total cholesterol in borderline-high range (200–239 mg/dL).',
        'HDL and triglycerides within acceptable limits.',
      ],
      recommendations: [
        'Consider titrating Atorvastatin from 20mg to 40mg.',
        'Adopt a Mediterranean diet — reduce saturated fat intake below 7% of total calories.',
        '30 minutes of moderate aerobic activity 5 days per week.',
        'Repeat lipid panel in 6–8 weeks post-intervention.',
      ],
    };
  },

  async generateHealthInsights(_patientHistory: unknown): Promise<HealthInsights> {
    await delay(2000);
    return {
      summary: 'Health telemetry analysis reveals a moderate cardiovascular risk profile with controllable risk factors. Adherence to current medication is key to improving long-term prognosis.',
      lifestyleTips: [
        'Reduce dietary sodium to under 1,500 mg/day.',
        'Target 7–9 hours of sleep nightly to improve cardiovascular health.',
        'Practice stress-reduction techniques such as mindfulness or breathing exercises.',
        'Limit alcohol to fewer than 2 units per week.',
      ],
      healthRisks: [
        'Elevated LDL increases 10-year ASCVD risk by approximately 12%.',
        'Mild hypertension if unmanaged may progress to Stage 2 within 18 months.',
      ],
      followUps: [
        'Cardiology follow-up: June 22, 2026 (upcoming).',
        'Repeat lipid panel: August 2026.',
        'Annual ophthalmology screening (hypertension-related retinopathy check).',
      ],
    };
  },

  async recommendMedicines(_symptoms: string, allergies: string[]): Promise<MedicineRecommendation> {
    await delay(2000);
    return {
      medicines: [
        {
          name: 'Amlodipine',
          genericName: 'Norvasc',
          dosage: '5mg',
          frequency: 'Once daily',
          reason: 'First-line calcium channel blocker for hypertension management.',
        },
        {
          name: 'Pantoprazole',
          genericName: 'Pan-40',
          dosage: '40mg',
          frequency: 'Once daily before breakfast',
          reason: 'Prophylactic gastroprotection during cardiovascular medication therapy.',
        },
      ],
      precautions: [
        `Allergy alert: The following patient allergies were considered: ${allergies.join(', ') || 'none listed'}.`,
        'Avoid grapefruit juice — may potentiate Amlodipine effect.',
        'Monitor for ankle oedema as a side effect of calcium channel blockers.',
      ],
    };
  },

  async calculateRiskScore(symptoms: string, _vitals: unknown): Promise<RiskScore> {
    await delay(2000);
    return {
      score: 62,
      level: 'Moderate',
      primaryRiskFactors: [
        'Hypertension (Stage 1)',
        'Dyslipidemia — elevated LDL',
        'Sedentary lifestyle indicators',
        `Reported symptoms: ${symptoms.substring(0, 40)}`,
      ],
      details:
        'Triage risk score of 62/100 indicates a moderate-risk patient requiring active monitoring but not immediate emergency intervention. Recommend outpatient cardiology review within 48 hours.',
    };
  },

  async checkInteractions(med1: string, med2: string): Promise<DrugInteraction> {
    await delay(1500);
    return {
      severity: 'Low',
      description: `No significant pharmacokinetic interaction was identified between ${med1} and ${med2} at standard therapeutic doses. Both agents can generally be co-administered under clinical supervision.`,
      precautions: [
        'Monitor blood pressure periodically if both agents affect cardiovascular parameters.',
        'Report any unusual fatigue, dizziness, or palpitations to your prescriber.',
        'Review full medication list with pharmacist at next refill.',
      ],
    };
  },
};
