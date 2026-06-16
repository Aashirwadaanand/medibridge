import { Router } from 'express';
import { AiController } from '../controllers/ai.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();

// Secure all AI endpoints with authentication middleware
router.use(authenticateUser);

/**
 * @route   POST /api/ai/analyze-symptoms
 * @desc    Analyze patient symptom description
 * @access  Private (Authenticated users)
 */
router.post('/analyze-symptoms', AiController.analyzeSymptoms);

/**
 * @route   POST /api/ai/analyze-report
 * @desc    Analyze clinical report details
 * @access  Private (Authenticated users)
 */
router.post('/analyze-report', AiController.analyzeMedicalReport);

/**
 * @route   POST /api/ai/health-insights
 * @desc    Generate wellness health insights based on patient history
 * @access  Private (Authenticated users)
 */
router.post('/health-insights', AiController.generateHealthInsights);

/**
 * @route   POST /api/ai/recommend-medicines
 * @desc    Recommend medicines avoiding specified allergies
 * @access  Private (Authenticated users)
 */
router.post('/recommend-medicines', AiController.recommendMedicines);

/**
 * @route   POST /api/ai/risk-score
 * @desc    Calculate triage clinical risk score
 * @access  Private (Authenticated users)
 */
router.post('/risk-score', AiController.calculateRiskScore);

/**
 * @route   POST /api/ai/check-interactions
 * @desc    Check drug-to-drug interactions
 * @access  Private (Authenticated users)
 */
router.post('/check-interactions', AiController.checkInteractions);

export default router;
