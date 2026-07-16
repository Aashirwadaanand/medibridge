import { Request, Response } from 'express';
import ScreeningService from '../services/screening.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export class ScreeningController {
  /**
   * Submit patient screening
   * POST /api/screenings
   */
  public static createScreening = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found.');
    }

    const chwId = req.user.id;
    const { patientId, screeningType, readings } = req.body;

    const screening = await ScreeningService.createScreening(chwId, patientId, {
      screeningType,
      readings,
    });

    res.status(201).json({
      status: 'success',
      message: 'Screening vitals uploaded successfully.',
      data: {
        screening,
      },
    });
  });

  /**
   * Get screenings
   * GET /api/screenings
   */
  public static listScreenings = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found.');
    }

    const screenings = await ScreeningService.listScreenings(req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      results: screenings.length,
      data: {
        screenings,
      },
    });
  });

  /**
   * Get screening details by ID
   * GET /api/screenings/:id
   */
  public static getScreeningById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found.');
    }

    const screening = await ScreeningService.getScreeningById(req.params.id, req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      data: {
        screening,
      },
    });
  });

  /**
   * Submit doctor review
   * PUT /api/screenings/:id/review
   */
  public static reviewScreening = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found.');
    }

    const doctorId = req.user.id;
    const { doctorNotes, actionTaken, followUpDate } = req.body;

    const screening = await ScreeningService.reviewScreening(req.params.id, doctorId, {
      doctorNotes,
      actionTaken,
      followUpDate,
    });

    res.status(200).json({
      status: 'success',
      message: 'Screening evaluation submitted successfully.',
      data: {
        screening,
      },
    });
  });
}
export default ScreeningController;
