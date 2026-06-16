import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps asynchronous Express handlers to automatically forward exceptions to next(error) middleware.
 * Eliminates duplicate try-catch block boilerplate.
 */
export const asyncHandler = (fn: RequestHandler): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
export default asyncHandler;
