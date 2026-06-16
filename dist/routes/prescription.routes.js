"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prescription_controller_1 = require("../controllers/prescription.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Secure all endpoints with user authentication middleware
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   POST /api/prescriptions
 * @desc    Create a new medical prescription
 * @access  Private (Doctors & Admins only)
 */
router.post('/', (0, auth_middleware_1.authorizeRoles)('doctor', 'admin'), validation_middleware_1.validatePrescriptionPayload, prescription_controller_1.PrescriptionController.createPrescription);
/**
 * @route   GET /api/prescriptions
 * @desc    Retrieve list of prescriptions (filters automatically by user role)
 * @access  Private (Patients, Doctors, Admins)
 */
router.get('/', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'admin'), prescription_controller_1.PrescriptionController.listPrescriptions);
/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update an existing prescription
 * @access  Private (Author Doctor & Admins only)
 */
router.put('/:id', (0, auth_middleware_1.authorizeRoles)('doctor', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), validation_middleware_1.validatePrescriptionPayload, prescription_controller_1.PrescriptionController.updatePrescription);
/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Delete a prescription
 * @access  Private (Author Doctor & Admins only)
 */
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('doctor', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), prescription_controller_1.PrescriptionController.deletePrescription);
exports.default = router;
