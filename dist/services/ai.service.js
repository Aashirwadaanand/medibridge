"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const ai_provider_1 = require("./ai.provider");
class AiService {
    /**
     * Helper to instantiate modular AI providers.
     * Enables seamless replacement of Gemini with custom models in the future.
     */
    static getProvider(mode) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (mode === 'live' && apiKey) {
            return new ai_provider_1.GeminiProvider(apiKey);
        }
        return new ai_provider_1.SimulatedProvider();
    }
    /**
     * Analyze symptom report.
     */
    static async analyzeSymptoms(symptoms, mode) {
        const provider = this.getProvider(mode);
        return provider.analyzeSymptoms(symptoms);
    }
    /**
     * Analyze clinical medical report details.
     */
    static async analyzeMedicalReport(title, content, mode) {
        const provider = this.getProvider(mode);
        return provider.analyzeMedicalReport(title, content);
    }
    /**
     * Generate personalized patient health insights.
     */
    static async generateHealthInsights(patientHistory, mode) {
        const provider = this.getProvider(mode);
        return provider.generateHealthInsights(patientHistory);
    }
    /**
     * Recommend medicines avoiding allergies list.
     */
    static async recommendMedicines(symptoms, allergies, mode) {
        const provider = this.getProvider(mode);
        return provider.recommendMedicines(symptoms, allergies);
    }
    /**
     * Calculate clinical triage risk score.
     */
    static async calculateRiskScore(symptoms, vitals, mode) {
        const provider = this.getProvider(mode);
        return provider.calculateRiskScore(symptoms, vitals);
    }
    /**
     * Check drug-to-drug interactions.
     */
    static async checkInteractions(med1, med2, mode) {
        const provider = this.getProvider(mode);
        return provider.checkInteractions(med1, med2);
    }
}
exports.AiService = AiService;
exports.default = AiService;
