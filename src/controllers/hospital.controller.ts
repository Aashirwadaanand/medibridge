import { Request, Response } from 'express';
import HospitalService from '../services/hospital.service';
import asyncHandler from '../utils/asyncHandler';

export class HospitalController {
  /**
   * Register a new hospital
   * POST /api/hospitals
   */
  public static createHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, location, address, contactNumber, specialists, bedsAvailable, emergencyAvailable, rating } = req.body;

    const hospital = await HospitalService.createHospital({
      name,
      location,
      address,
      contactNumber,
      specialists,
      bedsAvailable,
      emergencyAvailable,
      rating,
    });

    res.status(201).json({
      status: 'success',
      message: 'Hospital registered successfully.',
      data: {
        hospital,
      },
    });
  });

  /**
   * List all registered hospitals
   * GET /api/hospitals
   */
  public static listHospitals = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const hospitals = await HospitalService.listHospitals();

    res.status(200).json({
      status: 'success',
      results: hospitals.length,
      data: {
        hospitals,
      },
    });
  });

  /**
   * Fetch single hospital details
   * GET /api/hospitals/:id
   */
  public static getHospitalById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const hospitalId = req.params.id;
    const hospital = await HospitalService.getHospitalById(hospitalId);

    res.status(200).json({
      status: 'success',
      data: {
        hospital,
      },
    });
  });

  /**
   * Update hospital registry details
   * PUT /api/hospitals/:id
   */
  public static updateHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const hospitalId = req.params.id;
    const { name, location, address, contactNumber, specialists, bedsAvailable, emergencyAvailable, rating } = req.body;

    const hospital = await HospitalService.updateHospital(hospitalId, {
      name,
      location,
      address,
      contactNumber,
      specialists,
      bedsAvailable,
      emergencyAvailable,
      rating,
    });

    res.status(200).json({
      status: 'success',
      message: 'Hospital details updated successfully.',
      data: {
        hospital,
      },
    });
  });

  /**
   * Update hospital beds capacity
   * PATCH /api/hospitals/:id/beds
   */
  public static updateBeds = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const hospitalId = req.params.id;
    const { bedsAvailable } = req.body;

    const hospital = await HospitalService.updateHospital(hospitalId, {
      bedsAvailable,
    });

    res.status(200).json({
      status: 'success',
      message: 'Hospital beds capacity updated successfully.',
      data: {
        hospital,
      },
    });
  });

  /**
   * Delete hospital entry
   * DELETE /api/hospitals/:id
   */
  public static deleteHospital = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const hospitalId = req.params.id;

    await HospitalService.deleteHospital(hospitalId);

    res.status(200).json({
      status: 'success',
      message: 'Hospital registry entry deleted successfully.',
    });
  });
}
export default HospitalController;
