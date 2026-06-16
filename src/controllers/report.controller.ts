import { Request, Response } from 'express';
import ReportService from '../services/report.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export class ReportController {
  /**
   * Upload/Create a new medical report
   * POST /api/reports
   */
  public static uploadReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const doctorId = req.user.id;
    const { patientId, reportType, title, description, fileURL, doctorNotes } = req.body;

    const report = await ReportService.uploadReport(doctorId, patientId, {
      reportType,
      title,
      description,
      fileURL,
      doctorNotes,
    });

    res.status(201).json({
      status: 'success',
      message: 'Medical report uploaded successfully.',
      data: {
        report,
      },
    });
  });

  /**
   * List reports (filters automatically by user role)
   * GET /api/reports
   */
  public static listReports = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const reports = await ReportService.listReports(req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: {
        reports,
      },
    });
  });

  /**
   * Fetch single medical report by ID
   * GET /api/reports/:id
   */
  public static getReportById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const reportId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    const report = await ReportService.getReportById(reportId, userId, role);

    res.status(200).json({
      status: 'success',
      data: {
        report,
      },
    });
  });

  /**
   * Delete a medical report
   * DELETE /api/reports/:id
   */
  public static deleteReport = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const reportId = req.params.id;
    const userId = req.user.id;
    const role = req.user.role;

    await ReportService.deleteReport(reportId, userId, role);

    res.status(200).json({
      status: 'success',
      message: 'Medical report deleted successfully.',
    });
  });
}
export default ReportController;
