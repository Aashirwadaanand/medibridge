import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescription.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validatePrescriptionPayload, validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Secure all endpoints with user authentication middleware
router.use(authenticateUser);

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new medical prescription
 * @access  Private (Doctors & Admins only)
 */
router.post(
  '/',
  authorizeRoles('doctor', 'admin'),
  validatePrescriptionPayload,
  PrescriptionController.createPrescription
);

/**
 * @route   GET /api/prescriptions
 * @desc    Retrieve list of prescriptions (filters automatically by user role)
 * @access  Private (Patients, Doctors, Admins)
 */
router.get(
  '/',
  authorizeRoles('patient', 'doctor', 'admin'),
  PrescriptionController.listPrescriptions
);

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update an existing prescription
 * @access  Private (Author Doctor & Admins only)
 */
router.put(
  '/:id',
  authorizeRoles('doctor', 'admin'),
  validateRouteId('id'),
  validatePrescriptionPayload,
  PrescriptionController.updatePrescription
);

/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Delete a prescription
 * @access  Private (Author Doctor & Admins only)
 */
router.delete(
  '/:id',
  authorizeRoles('doctor', 'admin'),
  validateRouteId('id'),
  PrescriptionController.deletePrescription
);

export default router;
