"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalServerError = exports.ConflictError = exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.BadRequestError = exports.AppError = void 0;
/**
 * Base custom error class for operational (expected) application errors.
 */
class AppError extends Error {
    statusCode;
    isOperational;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        // Capture stack trace, excluding the constructor call from it
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
/**
 * 400 Bad Request Error
 */
class BadRequestError extends AppError {
    constructor(message = 'Bad request parameters') {
        super(message, 400);
    }
}
exports.BadRequestError = BadRequestError;
/**
 * 401 Unauthorized Error (e.g. invalid credentials or missing token)
 */
class UnauthorizedError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
/**
 * 403 Forbidden Error (e.g. authenticated but lack permissions/role)
 */
class ForbiddenError extends AppError {
    constructor(message = 'Access denied: insufficient permissions') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
/**
 * 404 Not Found Error
 */
class NotFoundError extends AppError {
    constructor(message = 'Requested resource not found') {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 409 Conflict Error (e.g. register with an email that already exists)
 */
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
/**
 * 500 Internal Server Error
 */
class InternalServerError extends AppError {
    constructor(message = 'Internal server error') {
        super(message, 500);
    }
}
exports.InternalServerError = InternalServerError;
