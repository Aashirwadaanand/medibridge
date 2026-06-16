"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errors_1 = require("../utils/errors");
/**
 * Authentication Middleware
 * Decodes the JWT access token and attaches the authenticated user payload to the request object.
 */
const authenticateUser = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer')) {
        throw new errors_1.UnauthorizedError('Access token is missing or invalid.');
    }
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET is not configured on the server.');
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        // Attach user payload (id, role) to express request context
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    }
    catch (error) {
        // Forward JWT expiration/parsing errors directly to the centralized error handler
        next(error);
    }
};
exports.authenticateUser = authenticateUser;
/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to endpoints based on the authenticated user's assigned role.
 *
 * @param allowedRoles List of roles permitted to access this resource
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            throw new errors_1.UnauthorizedError('User must be authenticated to access this resource.');
        }
        if (!allowedRoles.includes(req.user.role)) {
            throw new errors_1.ForbiddenError(`Access denied. Role '${req.user.role}' is not authorized to access this resource.`);
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
