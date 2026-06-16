import { Request, Response } from 'express';
import PrescriptionService from '../services/prescription.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export class PrescriptionController {
  /**
   * Create a new prescription
   * POST /api/prescriptions
   */
  public static createPrescription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const doctorId = req.user.id;
    const { patientId, medicines, dosage, instructions } = req.body;

    const prescription = await PrescriptionService.createPrescription(doctorId, patientId, {
      medicines,
      dosage,
      instructions,
    });

    res.status(201).json({
      status: 'success',
      message: 'Prescription created successfully.',
      data: {
        prescription,
      },
    });
  });

  /**
   * List prescriptions (filters automatically by user role)
   * GET /api/prescriptions
   */
  public static listPrescriptions = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const prescriptions = await PrescriptionService.listPrescriptions(req.user.id, req.user.role);

    res.status(200).json({
      status: 'success',
      results: prescriptions.length,
      data: {
        prescriptions,
      },
    });
  });

  /**
   * Update an existing prescription
   * PUT /api/prescriptions/:id
   */
  public static updatePrescription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const prescriptionId = req.params.id;
    const doctorId = req.user.id;
    const role = req.user.role;
    const { medicines, dosage, instructions } = req.body;

    const prescription = await PrescriptionService.updatePrescription(prescriptionId, doctorId, role, {
      medicines,
      dosage,
      instructions,
    });

    res.status(200).json({
      status: 'success',
      message: 'Prescription updated successfully.',
      data: {
        prescription,
      },
    });
  });

  /**
   * Delete an existing prescription
   * DELETE /api/prescriptions/:id
   */
  public static deletePrescription = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const prescriptionId = req.params.id;
    const doctorId = req.user.id;
    const role = req.user.role;

    await PrescriptionService.deletePrescription(prescriptionId, doctorId, role);

    res.status(200).json({
      status: 'success',
      message: 'Prescription deleted successfully.',
    });
  });
}
export default PrescriptionController;
