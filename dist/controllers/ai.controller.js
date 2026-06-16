"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiController = void 0;
const ai_service_1 = require("../services/ai.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class AiController {
    /**
     * Helper to parse app mode header from request context.
     */
    static getAppMode(req) {
        return req.headers['x-app-mode'] || 'demo';
    }
    /**
     * POST /api/ai/analyze-symptoms
     */
    static analyzeSymptoms = (0, asyncHandler_1.default)(async (req, res) => {
        const { symptoms } = req.body;
        if (!symptoms) {
            throw new errors_1.BadRequestError('symptoms field is required.');
        }
        const mode = AiController.getAppMode(req);
        const analysis = await ai_service_1.AiService.analyzeSymptoms(symptoms, mode);
        res.status(200).json({
            status: 'success',
            data: analysis
        });
    });
    /**
     * POST /api/ai/analyze-report
     */
    static analyzeMedicalReport = (0, asyncHandler_1.default)(async (req, res) => {
        const { title, content } = req.body;
        if (!title || !content) {
            throw new errors_1.BadRequestError('title and content fields are required.');
        }
        const mode = AiController.getAppMode(req);
        const analysis = await ai_service_1.AiService.analyzeMedicalReport(title, content, mode);
        res.status(200).json({
            status: 'success',
            data: analysis
        });
    });
    /**
     * POST /api/ai/health-insights
     */
    static generateHealthInsights = (0, asyncHandler_1.default)(async (req, res) => {
        const { patientHistory } = req.body;
        if (!patientHistory) {
            throw new errors_1.BadRequestError('patientHistory field is required.');
        }
        const mode = AiController.getAppMode(req);
        const insights = await ai_service_1.AiService.generateHealthInsights(patientHistory, mode);
        res.status(200).json({
            status: 'success',
            data: insights
        });
    });
    /**
     * POST /api/ai/recommend-medicines
     */
    static recommendMedicines = (0, asyncHandler_1.default)(async (req, res) => {
        const { symptoms, allergies } = req.body;
        if (!symptoms) {
            throw new errors_1.BadRequestError('symptoms field is required.');
        }
        const mode = AiController.getAppMode(req);
        const parsedAllergies = Array.isArray(allergies) ? allergies : [];
        const recommendations = await ai_service_1.AiService.recommendMedicines(symptoms, parsedAllergies, mode);
        res.status(200).json({
            status: 'success',
            data: recommendations
        });
    });
    /**
     * POST /api/ai/risk-score
     */
    static calculateRiskScore = (0, asyncHandler_1.default)(async (req, res) => {
        const { symptoms, vitals } = req.body;
        if (!symptoms) {
            throw new errors_1.BadRequestError('symptoms field is required.');
        }
        const mode = AiController.getAppMode(req);
        const result = await ai_service_1.AiService.calculateRiskScore(symptoms, vitals || {}, mode);
        res.status(200).json({
            status: 'success',
            data: result
        });
    });
    /**
     * POST /api/ai/check-interactions
     */
    static checkInteractions = (0, asyncHandler_1.default)(async (req, res) => {
        const { med1, med2 } = req.body;
        if (!med1 || !med2) {
            throw new errors_1.BadRequestError('med1 and med2 fields are required.');
        }
        const mode = AiController.getAppMode(req);
        const result = await ai_service_1.AiService.checkInteractions(med1, med2, mode);
        res.status(200).json({
            status: 'success',
            data: result
        });
    });
}
exports.AiController = AiController;
exports.default = AiController;
