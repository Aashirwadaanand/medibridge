import { Router } from 'express';
import { HospitalController } from '../controllers/hospital.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateHospitalPayload, validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Secure all endpoints with authentication
router.use(authenticateUser);

/**
 * @route   GET /api/hospitals
 * @desc    Get all registered hospitals
 * @access  Private (All authenticated roles)
 */
router.get(
  '/',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  HospitalController.listHospitals
);

/**
 * @route   GET /api/hospitals/:id
 * @desc    Get a single hospital details
 * @access  Private (All authenticated roles)
 */
router.get(
  '/:id',
  authorizeRoles('patient', 'doctor', 'hospital', 'pharmacy', 'admin'),
  validateRouteId('id'),
  HospitalController.getHospitalById
);

/**
 * @route   POST /api/hospitals
 * @desc    Register a new hospital registry entry
 * @access  Private (Hospital users and Admins only)
 */
router.post(
  '/',
  authorizeRoles('hospital', 'admin'),
  validateHospitalPayload,
  HospitalController.createHospital
);

/**
 * @route   PUT /api/hospitals/:id
 * @desc    Update hospital details
 * @access  Private (Hospital users and Admins only)
 */
router.put(
  '/:id',
  authorizeRoles('hospital', 'admin'),
  validateRouteId('id'),
  validateHospitalPayload,
  HospitalController.updateHospital
);

/**
 * @route   PATCH /api/hospitals/:id/beds
 * @desc    Update hospital available beds capacity
 * @access  Private (Hospital users and Admins only)
 */
router.patch(
  '/:id/beds',
  authorizeRoles('hospital', 'admin'),
  validateRouteId('id'),
  validateHospitalPayload,
  HospitalController.updateBeds
);

/**
 * @route   DELETE /api/hospitals/:id
 * @desc    Delete a hospital registry entry
 * @access  Private (Admins only)
 */
router.delete(
  '/:id',
  authorizeRoles('admin'),
  validateRouteId('id'),
  HospitalController.deleteHospital
);

export default router;
