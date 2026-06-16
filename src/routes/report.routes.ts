import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';
import { authenticateUser, authorizeRoles } from '../middleware/auth.middleware';
import { validateReportUpload, validateRouteId } from '../middleware/validation.middleware';

const router = Router();

// Secure all endpoints below with JWT verification middleware
router.use(authenticateUser);

/**
 * @route   POST /api/reports
 * @desc    Upload a new medical report
 * @access  Private (Doctors & Admins only)
 */
router.post(
  '/',
  authorizeRoles('doctor', 'admin'),
  validateReportUpload,
  ReportController.uploadReport
);

/**
 * @route   GET /api/reports
 * @desc    Retrieve list of medical reports (filters automatically by user role)
 * @access  Private (Patients, Doctors, Admins)
 */
router.get(
  '/',
  authorizeRoles('patient', 'doctor', 'admin'),
  ReportController.listReports
);

/**
 * @route   GET /api/reports/:id
 * @desc    Get detailed view of a specific medical report
 * @access  Private (Authorized Patient, Author Doctor, Admin only)
 */
router.get(
  '/:id',
  authorizeRoles('patient', 'doctor', 'admin'),
  validateRouteId('id'),
  ReportController.getReportById
);

/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a medical report
 * @access  Private (Author Doctor & Admins only)
 */
router.delete(
  '/:id',
  authorizeRoles('doctor', 'admin'),
  validateRouteId('id'),
  ReportController.deleteReport
);

export default router;
