import { Request, Response } from 'express';
import MedicineService from '../services/medicine.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export class MedicineController {
  /**
   * Add a new medicine record in inventory
   * POST /api/medicines
   */
  public static createMedicine = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const pharmacyId = req.user.id;
    const { name, genericName, manufacturer, price, stock, expiryDate, category, requiresPrescription } = req.body;

    const medicine = await MedicineService.createMedicine(pharmacyId, {
      name,
      genericName,
      manufacturer,
      price,
      stock,
      expiryDate,
      category,
      requiresPrescription,
    });

    res.status(201).json({
      status: 'success',
      message: 'Medicine added to inventory successfully.',
      data: {
        medicine,
      },
    });
  });

  /**
   * List all medicine inventory items
   * GET /api/medicines
   */
  public static listMedicines = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    // Allows filtering by query parameter pharmacyId (e.g. /api/medicines?pharmacyId=abc)
    const { pharmacyId } = req.query;
    
    const medicines = await MedicineService.listMedicines({
      pharmacyId: pharmacyId ? String(pharmacyId) : undefined,
    });

    res.status(200).json({
      status: 'success',
      results: medicines.length,
      data: {
        medicines,
      },
    });
  });

  /**
   * Fetch single medicine details
   * GET /api/medicines/:id
   */
  public static getMedicineById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const medicineId = req.params.id;
    const medicine = await MedicineService.getMedicineById(medicineId);

    res.status(200).json({
      status: 'success',
      data: {
        medicine,
      },
    });
  });

  /**
   * Update medicine inventory entry details
   * PUT /api/medicines/:id
   */
  public static updateMedicine = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const medicineId = req.params.id;
    const pharmacyId = req.user.id;
    const role = req.user.role;
    const { name, genericName, manufacturer, price, stock, expiryDate, category, requiresPrescription } = req.body;

    const medicine = await MedicineService.updateMedicine(medicineId, pharmacyId, role, {
      name,
      genericName,
      manufacturer,
      price,
      stock,
      expiryDate,
      category,
      requiresPrescription,
    });

    res.status(200).json({
      status: 'success',
      message: 'Medicine inventory details updated successfully.',
      data: {
        medicine,
      },
    });
  });

  /**
   * Delete medicine inventory entry
   * DELETE /api/medicines/:id
   */
  public static deleteMedicine = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const medicineId = req.params.id;
    const pharmacyId = req.user.id;
    const role = req.user.role;

    await MedicineService.deleteMedicine(medicineId, pharmacyId, role);

    res.status(200).json({
      status: 'success',
      message: 'Medicine inventory record deleted successfully.',
    });
  });
}
export default MedicineController;
