import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateUser } from '../middleware/auth.middleware';

const router = Router();
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
router.post('/register', AuthController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get JWT access token
 * @access  Public
 */
router.post('/login', AuthController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private (Authenticated)
 */
router.get('/profile', authenticateUser, AuthController.getProfile);

/**
 * @route   GET /api/auth/patients
 * @desc    Get all patient role users
 * @access  Private (Clinicians and Admins)
 */
router.get('/patients', authenticateUser, AuthController.listPatients);

/**
 * @route   GET /api/auth/patients/:id
 * @desc    Get patient profile details
 * @access  Private (Clinicians and Admins)
 */
router.get('/patients/:id', authenticateUser, AuthController.getPatientProfile);

export default router;
