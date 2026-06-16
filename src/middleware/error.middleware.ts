import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

/**
 * Express error-handling middleware.
 * Formats custom AppErrors and handles unexpected application errors, hiding details in production.
 */
export const errorMiddleware = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV === 'development';
  let statusCode = 500;
  let message = 'An unexpected error occurred.';
  let errors: unknown = undefined;

  // Handle Mongoose duplicate key errors (code 11000)
  if ('code' in err && err.code === 11000) {
    statusCode = 409;
    const field = Object.keys((err as any).keyValue || {}).join(', ') || 'field';
    message = `Duplicate field value entered: ${field}. Please use another value.`;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values((err as any).errors || {}).map((val: any) => ({
      field: val.path,
      message: val.message,
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please log in again.';
  }

  // If it's a known operational AppError, extract details
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else {
    // Log unexpected code exceptions for observability (e.g. databases down, syntax bugs)
    console.error('UNEXPECTED SYSTEM ERROR:', err);
  }

  res.status(statusCode).json({
    status: 'error',
    message,
    ...(errors ? { errors } : {}),
    ...(isDev ? { stack: err.stack } : {}),
  });
};
