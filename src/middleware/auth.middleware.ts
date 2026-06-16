import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../utils/errors';
import { IJwtPayload } from '../types/auth.interface';
import { UserRole } from '../types/user.interface';

/**
 * Authentication Middleware
 * Decodes the JWT access token and attaches the authenticated user payload to the request object.
 */
export const authenticateUser = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthorizedError('Access token is missing or invalid.');
  }

  const token = authHeader.split(' ')[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured on the server.');
  }

  try {
    const decoded = jwt.verify(token, secret) as IJwtPayload;

    // Attach user payload (id, role) to express request context
    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (error) {
    // Forward JWT expiration/parsing errors directly to the centralized error handler
    next(error);
  }
};

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts access to endpoints based on the authenticated user's assigned role.
 * 
 * @param allowedRoles List of roles permitted to access this resource
 */
export const authorizeRoles = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError('User must be authenticated to access this resource.');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. Role '${req.user.role}' is not authorized to access this resource.`
      );
    }

    next();
  };
};
