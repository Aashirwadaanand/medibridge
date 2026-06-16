import { Router } from 'express';
import { MedicineController } from '../controllers/medicine.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateMedicinePayload, validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Secure all endpoints with authentication
router.use(authenticateUser);

/**
 * @route   GET /api/medicines
 * @desc    Get all medicine catalog listings
 * @access  Private (All authenticated roles)
 */
router.get(
  '/',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  MedicineController.listMedicines
);

/**
 * @route   GET /api/medicines/:id
 * @desc    Get details of a single medicine entry
 * @access  Private (All authenticated roles)
 */
router.get(
  '/:id',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  validateRouteId('id'),
  MedicineController.getMedicineById
);

/**
 * @route   POST /api/medicines
 * @desc    Add a medicine record in pharmacy inventory
 * @access  Private (Pharmacy users and Admins only)
 */
router.post(
  '/',
  authorizeRoles('pharmacy', 'admin'),
  validateMedicinePayload,
  MedicineController.createMedicine
);

/**
 * @route   PUT /api/medicines/:id
 * @desc    Update medicine inventory details
 * @access  Private (Pharmacy users and Admins only)
 */
router.put(
  '/:id',
  authorizeRoles('pharmacy', 'admin'),
  validateRouteId('id'),
  validateMedicinePayload,
  MedicineController.updateMedicine
);

/**
 * @route   DELETE /api/medicines/:id
 * @desc    Delete a medicine entry from inventory
 * @access  Private (Pharmacy users and Admins only)
 */
router.delete(
  '/:id',
  authorizeRoles('pharmacy', 'admin'),
  validateRouteId('id'),
  MedicineController.deleteMedicine
);

export default router;
