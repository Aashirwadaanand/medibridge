import { IAiProvider, GeminiProvider, SimulatedProvider } from './ai.provider';

export class AiService {
  /**
   * Helper to instantiate modular AI providers.
   * Enables seamless replacement of Gemini with custom models in the future.
   */
  private static getProvider(mode: string): IAiProvider {
    const apiKey = process.env.GEMINI_API_KEY;
    if (mode === 'live' && apiKey) {
      return new GeminiProvider(apiKey);
    }
    return new SimulatedProvider();
  }

  /**
   * Analyze symptom report.
   */
  public static async analyzeSymptoms(symptoms: string, mode: string): Promise<any> {
    const provider = this.getProvider(mode);
    return provider.analyzeSymptoms(symptoms);
  }

  /**
   * Analyze clinical medical report details.
   */
  public static async analyzeMedicalReport(title: string, content: string, mode: string): Promise<any> {
    const provider = this.getProvider(mode);
    return provider.analyzeMedicalReport(title, content);
  }

  /**
   * Generate personalized patient health insights.
   */
  public static async generateHealthInsights(patientHistory: any, mode: string): Promise<any> {
    const provider = this.getProvider(mode);
    return provider.generateHealthInsights(patientHistory);
  }

  /**
   * Recommend medicines avoiding allergies list.
   */
  public static async recommendMedicines(symptoms: string, allergies: string[], mode: string): Promise<any> {
    const provider = this.getProvider(mode);
    return provider.recommendMedicines(symptoms, allergies);
  }

  /**
   * Calculate clinical triage risk score.
   */
  public static async calculateRiskScore(symptoms: string, vitals: any, mode: string): Promise<any> {
    const provider = this.getProvider(mode);
    return provider.calculateRiskScore(symptoms, vitals);
  }

  /**
   * Check drug-to-drug interactions.
   */
  public static async checkInteractions(med1: string, med2: string, mode: string): Promise<any> {
    const provider = this.getProvider(mode);
    return provider.checkInteractions(med1, med2);
  }
}

export default AiService;
