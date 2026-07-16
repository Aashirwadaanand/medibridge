"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', (_req, res) => {
    res.json({
        status: 'success',
        message: 'Auth API is working'
    });
});
/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (patient, doctor, hospital, pharmacy, admin)
 * @access  Public
 */
router.post('/register', auth_controller_1.AuthController.register);
/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT access token
 * @access  Public
 */
router.post('/login', auth_controller_1.AuthController.login);
/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (Authenticated)
 */
router.get('/profile', auth_middleware_1.authenticateUser, auth_controller_1.AuthController.getProfile);
/**
 * @route   GET /api/auth/patients
 * @desc    Get all patient role users
 * @access  Private (Clinicians and Admins)
 */
router.get('/patients', auth_middleware_1.authenticateUser, auth_controller_1.AuthController.listPatients);
/**
 * @route   GET /api/auth/patients/:id
 * @desc    Get patient profile details
 * @access  Private (Clinicians and Admins)
 */
router.get('/patients/:id', auth_middleware_1.authenticateUser, auth_controller_1.AuthController.getPatientProfile);
exports.default = router;
