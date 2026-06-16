import jwt, { SignOptions } from 'jsonwebtoken';


import User from '../models/user.model';
import { IUser } from '../types/user.interface';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../utils/errors';
import { IRegisterInput, ILoginInput, IAuthResponse } from '../types/auth.interface';

export class AuthService {
  /**
   * Generates a JWT access token for a user.
   */
  public static generateToken(user: IUser): string {
    const secret = process.env.JWT_SECRET;
    const expiresIn = process.env.JWT_EXPIRES_IN || '30d';

    if (!secret) {
      throw new Error('JWT_SECRET configuration is missing.');
    }

    return jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      secret,
      {
        expiresIn
      } as SignOptions
    );
  }

  /**
   * Registers a new user with password hashing (handled by Mongoose model hooks).
   */
  public static async register(input: IRegisterInput): Promise<IAuthResponse> {
    const { name, email, password, role } = input;

    if (!name || !email || !password || !role) {
      throw new BadRequestError('Name, email, password, and role are required fields.');
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('A user with this email address already exists.');
    }

    // Create and save new user doc
    const newUser = new User({
      name,
      email,
      password,
      role,
    });

    await newUser.save();

    // Generate JWT token
    const token = this.generateToken(newUser);

    return {
      token,
      user: newUser,
    };
  }

  /**
   * Logs in an existing user and returns their user profile and generated JWT token.
   */
  public static async login(input: ILoginInput): Promise<IAuthResponse> {
    const { email, password } = input;

    if (!email || !password) {
      throw new BadRequestError('Email and password are required fields.');
    }

    // Retrieve user and explicitly select password field (since select: false is set in schema)
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials or user account deactivated.');
    }

    // Verify candidate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials.');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return {
      token,
      user,
    };
  }

  /**
   * Retrieves a user profile by their database ID.
   */
  public static async getUserProfile(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found.');
    }
    return user;
  }

  /**
   * List all users with role 'patient'.
   */
  public static async listPatients(): Promise<IUser[]> {
    return User.find({ role: 'patient' }).sort({ name: 1 });
  }

  /**
   * Retrieves a patient profile and history by user ID.
   */
  public static async getPatientProfile(patientId: string): Promise<IUser> {
    const user = await User.findById(patientId);
    if (!user || user.role !== 'patient') {
      throw new NotFoundError('Patient profile not found.');
    }
    return user;
  }
}
