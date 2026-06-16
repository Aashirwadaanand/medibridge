import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import asyncHandler from '../utils/asyncHandler';
import { UnauthorizedError } from '../utils/errors';

export class AuthController {
  /**
   * Handle user registration
   * POST /api/auth/register
   */
  public static register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    
    const result = await AuthService.register({ name, email, password, role });
    
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
  public static login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    const result = await AuthService.login({ email, password });

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
  public static getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    if (!req.user || !req.user.id) {
      throw new UnauthorizedError('User authentication details not found in request context.');
    }

    const user = await AuthService.getUserProfile(req.user.id);

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
  public static listPatients = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const patients = await AuthService.listPatients();
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
  public static getPatientProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const patientId = req.params.id;
    const patient = await AuthService.getPatientProfile(patientId);
    res.status(200).json({
      status: 'success',
      data: {
        patient,
      },
    });
  });
}
