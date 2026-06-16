"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_controller_1 = require("../controllers/ai.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Secure all AI endpoints with authentication middleware
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   POST /api/ai/analyze-symptoms
 * @desc    Analyze patient symptom description
 * @access  Private (Authenticated users)
 */
router.post('/analyze-symptoms', ai_controller_1.AiController.analyzeSymptoms);
/**
 * @route   POST /api/ai/analyze-report
 * @desc    Analyze clinical report details
 * @access  Private (Authenticated users)
 */
router.post('/analyze-report', ai_controller_1.AiController.analyzeMedicalReport);
/**
 * @route   POST /api/ai/health-insights
 * @desc    Generate wellness health insights based on patient history
 * @access  Private (Authenticated users)
 */
router.post('/health-insights', ai_controller_1.AiController.generateHealthInsights);
/**
 * @route   POST /api/ai/recommend-medicines
 * @desc    Recommend medicines avoiding specified allergies
 * @access  Private (Authenticated users)
 */
router.post('/recommend-medicines', ai_controller_1.AiController.recommendMedicines);
/**
 * @route   POST /api/ai/risk-score
 * @desc    Calculate triage clinical risk score
 * @access  Private (Authenticated users)
 */
router.post('/risk-score', ai_controller_1.AiController.calculateRiskScore);
/**
 * @route   POST /api/ai/check-interactions
 * @desc    Check drug-to-drug interactions
 * @access  Private (Authenticated users)
 */
router.post('/check-interactions', ai_controller_1.AiController.checkInteractions);
exports.default = router;
