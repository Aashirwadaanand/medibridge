"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const hospital_controller_1 = require("../controllers/hospital.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validation_middleware_1 = require("../middleware/validation.middleware");
const router = (0, express_1.Router)();
// Secure all endpoints with authentication
router.use(auth_middleware_1.authenticateUser);
/**
 * @route   GET /api/hospitals
 * @desc    Get all registered hospitals
 * @access  Private (All authenticated roles)
 */
router.get('/', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), hospital_controller_1.HospitalController.listHospitals);
/**
 * @route   GET /api/hospitals/:id
 * @desc    Get a single hospital details
 * @access  Private (All authenticated roles)
 */
router.get('/:id', (0, auth_middleware_1.authorizeRoles)('patient', 'doctor', 'hospital', 'pharmacy', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), hospital_controller_1.HospitalController.getHospitalById);
/**
 * @route   POST /api/hospitals
 * @desc    Register a new hospital registry entry
 * @access  Private (Hospital users and Admins only)
 */
router.post('/', (0, auth_middleware_1.authorizeRoles)('hospital', 'admin'), validation_middleware_1.validateHospitalPayload, hospital_controller_1.HospitalController.createHospital);
/**
 * @route   PUT /api/hospitals/:id
 * @desc    Update hospital details
 * @access  Private (Hospital users and Admins only)
 */
router.put('/:id', (0, auth_middleware_1.authorizeRoles)('hospital', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), validation_middleware_1.validateHospitalPayload, hospital_controller_1.HospitalController.updateHospital);
/**
 * @route   PATCH /api/hospitals/:id/beds
 * @desc    Update hospital available beds capacity
 * @access  Private (Hospital users and Admins only)
 */
router.patch('/:id/beds', (0, auth_middleware_1.authorizeRoles)('hospital', 'admin'), (0, validation_middleware_1.validateRouteId)('id'), validation_middleware_1.validateHospitalPayload, hospital_controller_1.HospitalController.updateBeds);
/**
 * @route   DELETE /api/hospitals/:id
 * @desc    Delete a hospital registry entry
 * @access  Private (Admins only)
 */
router.delete('/:id', (0, auth_middleware_1.authorizeRoles)('admin'), (0, validation_middleware_1.validateRouteId)('id'), hospital_controller_1.HospitalController.deleteHospital);
exports.default = router;
