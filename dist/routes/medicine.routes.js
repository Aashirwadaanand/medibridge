"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const medicine_controller_1 = require("../controllers/medicine.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Secure all endpoints with authentication
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   GET /api/medicines
 * @desc    Get all medicine catalog listings
 * @access  Private (All authenticated roles)
 */
router.get('/', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), medicine_controller_1.MedicineController.listMedicines);
/**
 * @route   GET /api/medicines/:id
 * @desc    Get details of a single medicine entry
 * @access  Private (All authenticated roles)
 */
router.get('/:id', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), medicine_controller_1.MedicineController.getMedicineById);
/**
 * @route   POST /api/medicines
 * @desc    Add a medicine record in pharmacy inventory
 * @access  Private (Pharmacy users and Admins only)
 */
router.post('/', (0, auth_middleware_1.authorizeRoles)('pharmacy', 'admin'), validation_middleware_1.validateMedicinePayload, medicine_controller_1.MedicineController.createMedicine);
/**
 * @route   PUT /api/medicines/:id
 * @desc    Update medicine inventory details
 * @access  Private (Pharmacy users and Admins only)
 */
router.put('/:id', (0, auth_middleware_1.authorizeRoles)('pharmacy', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), validation_middleware_1.validateMedicinePayload, medicine_controller_1.MedicineController.updateMedicine);
/**
 * @route   DELETE /api/medicines/:id
 * @desc    Delete a medicine entry from inventory
 * @access  Private (Pharmacy users and Admins only)
 */
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('pharmacy', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), medicine_controller_1.MedicineController.deleteMedicine);
exports.default = router;
