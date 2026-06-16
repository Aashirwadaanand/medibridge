"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const asyncHandler_1 = __importDefault(require("../utils/asyncHandler"));
const errors_1 = require("../utils/errors");
class AuthController {
    /**
     * Handle user registration
     * POST /api/auth/register
     */
    static register = (0, asyncHandler_1.default)(async (req, res) => {
        const { name, email, password, role } = req.body;
        const result = await auth_service_1.AuthService.register({ name, email, password, role });
        res.status(201).json({
            status: 'success',
            message: 'User registered successfully.',
            data: {
                token: result.token,
                user: result.user,
            },
        });
    });
    /**
     * Handle user authentication
     * POST /api/auth/login
     */
    static login = (0, asyncHandler_1.default)(async (req, res) => {
        const { email, password } = req.body;
        const result = await auth_service_1.AuthService.login({ email, password });
        res.status(200).json({
            status: 'success',
            message: 'Login successful.',
            data: {
                token: result.token,
                user: result.user,
            },
        });
    });
    /**
     * Get currently authenticated user profile
     * GET /api/auth/profile
     */
    static getProfile = (0, asyncHandler_1.default)(async (req, res) => {
        if (!req.user || !req.user.id) {
            throw new errors_1.UnauthorizedError('User authentication details not found in request context.');
        }
        const user = await auth_service_1.AuthService.getUserProfile(req.user.id);
        res.status(200).json({
            status: 'success',
            data: {
                user,
            },
        });
    });
    /**
     * Get all patient users (Clinicians and Admins only)
     * GET /api/auth/patients
     */
    static listPatients = (0, asyncHandler_1.default)(async (_req, res) => {
        const patients = await auth_service_1.AuthService.listPatients();
        res.status(200).json({
            status: 'success',
            data: {
                patients,
            },
        });
    });
    /**
     * Get detail patient profile by ID (Clinicians and Admins only)
     * GET /api/auth/patients/:id
     */
    static getPatientProfile = (0, asyncHandler_1.default)(async (req, res) => {
        const patientId = req.params.id;
        const patient = await auth_service_1.AuthService.getPatientProfile(patientId);
        res.status(200).json({
            status: 'success',
            data: {
                patient,
            },
        });
    });
}
exports.AuthController = AuthController;
