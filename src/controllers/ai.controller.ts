import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';
import asyncHandler from '../utils/asyncHandler';
import { BadRequestError } from '../utils/errors';

export class AiController {
  /**
   * Helper to parse app mode header from request context.
   */
  private static getAppMode(req: Request): string {
    return (req.headers['x-app-mode'] as string) || 'demo';
  }

  /**
   * POST /api/ai/analyze-symptoms
   */
  public static analyzeSymptoms = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { symptoms } = req.body;
    if (!symptoms) {
      throw new BadRequestError('symptoms field is required.');
    }

    const mode = AiController.getAppMode(req);
    const analysis = await AiService.analyzeSymptoms(symptoms, mode);

    res.status(200).json({
      status: 'success',
      data: analysis
    });
  });

  /**
   * POST /api/ai/analyze-report
   */
  public static analyzeMedicalReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { title, content } = req.body;
    if (!title || !content) {
      throw new BadRequestError('title and content fields are required.');
    }

    const mode = AiController.getAppMode(req);
    const analysis = await AiService.analyzeMedicalReport(title, content, mode);

    res.status(200).json({
      status: 'success',
      data: analysis
    });
  });

  /**
   * POST /api/ai/health-insights
   */
  public static generateHealthInsights = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { patientHistory } = req.body;
    if (!patientHistory) {
      throw new BadRequestError('patientHistory field is required.');
    }

    const mode = AiController.getAppMode(req);
    const insights = await AiService.generateHealthInsights(patientHistory, mode);

    res.status(200).json({
      status: 'success',
      data: insights
    });
  });

  /**
   * POST /api/ai/recommend-medicines
   */
  public static recommendMedicines = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { symptoms, allergies } = req.body;
    if (!symptoms) {
      throw new BadRequestError('symptoms field is required.');
    }

    const mode = AiController.getAppMode(req);
    const parsedAllergies = Array.isArray(allergies) ? allergies : [];
    const recommendations = await AiService.recommendMedicines(symptoms, parsedAllergies, mode);

    res.status(200).json({
      status: 'success',
      data: recommendations
    });
  });

  /**
   * POST /api/ai/risk-score
   */
  public static calculateRiskScore = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { symptoms, vitals } = req.body;
    if (!symptoms) {
      throw new BadRequestError('symptoms field is required.');
    }

    const mode = AiController.getAppMode(req);
    const result = await AiService.calculateRiskScore(symptoms, vitals || {}, mode);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });

  /**
   * POST /api/ai/check-interactions
   */
  public static checkInteractions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { med1, med2 } = req.body;
    if (!med1 || !med2) {
      throw new BadRequestError('med1 and med2 fields are required.');
    }

    const mode = AiController.getAppMode(req);
    const result = await AiService.checkInteractions(med1, med2, mode);

    res.status(200).json({
      status: 'success',
      data: result
    });
  });
}

export default AiController;
