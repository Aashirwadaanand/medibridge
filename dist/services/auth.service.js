"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importDefault(require("../models/user.model"));
const errors_1 = require("../utils/errors");
class AuthService {
    /**
     * Generates a JWT access token for a user.
     */
    static generateToken(user) {
        const secret = process.env.JWT_SECRET;
        const expiresIn = process.env.JWT_EXPIRES_IN || '30d';
        if (!secret) {
            throw new Error('JWT_SECRET configuration is missing.');
        }
        return jsonwebtoken_1.default.sign({
            id: user._id,
            role: user.role,
        }, secret, {
            expiresIn
        });
    }
    /**
     * Registers a new user with password hashing (handled by Mongoose model hooks).
     */
    static async register(input) {
        const { name, email, password, role } = input;
        if (!name || !email || !password || !role) {
            throw new errors_1.BadRequestError('Name, email, password, and role are required fields.');
        }
        // Check if the user already exists
        const existingUser = await user_model_1.default.findOne({ email });
        if (existingUser) {
            throw new errors_1.ConflictError('A user with this email address already exists.');
        }
        // Create and save new user doc
        const newUser = new user_model_1.default({
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
    static async login(input) {
        const { email, password } = input;
        if (!email || !password) {
            throw new errors_1.BadRequestError('Email and password are required fields.');
        }
        // Retrieve user and explicitly select password field (since select: false is set in schema)
        const user = await user_model_1.default.findOne({ email }).select('+password');
        if (!user || !user.isActive) {
            throw new errors_1.UnauthorizedError('Invalid credentials or user account deactivated.');
        }
        // Verify candidate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError('Invalid credentials.');
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
    static async getUserProfile(userId) {
        const user = await user_model_1.default.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User profile not found.');
        }
        return user;
    }
    /**
     * List all users with role 'patient'.
     */
    static async listPatients() {
        return user_model_1.default.find({ role: 'patient' }).sort({ name: 1 });
    }
    /**
     * Retrieves a patient profile and history by user ID.
     */
    static async getPatientProfile(patientId) {
        const user = await user_model_1.default.findById(patientId);
        if (!user || user.role !== 'patient') {
            throw new errors_1.NotFoundError('Patient profile not found.');
        }
        return user;
    }
}
exports.AuthService = AuthService;
