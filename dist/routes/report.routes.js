"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("../controllers/report.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Secure all endpoints below with JWT verification middleware
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   POST /api/reports
 * @desc    Upload a new medical report
 * @access  Private (Doctors & Admins only)
 */
router.post('/', (0, auth_middleware_1.authorizeRoles)('doctor', 'admin'), validation_middleware_1.validateReportUpload, report_controller_1.ReportController.uploadReport);
/**
 * @route   GET /api/reports
 * @desc    Retrieve list of medical reports (filters automatically by user role)
 * @access  Private (Patients, Doctors, Admins)
 */
router.get('/', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'admin'), report_controller_1.ReportController.listReports);
/**
 * @route   GET /api/reports/:id
 * @desc    Get detailed view of a specific medical report
 * @access  Private (Authorized Patient, Author Doctor, Admin only)
 */
router.get('/:id', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), report_controller_1.ReportController.getReportById);
/**
 * @route   DELETE /api/reports/:id
 * @desc    Delete a medical report
 * @access  Private (Author Doctor & Admins only)
 */
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('doctor', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), report_controller_1.ReportController.deleteReport);
exports.default = router;
