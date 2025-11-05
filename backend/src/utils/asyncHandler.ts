import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper to catch errors in async route handlers
 * Prevents unhandled promise rejections from crashing the server
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
      // Log the error
      console.error('Async handler caught error:', error);
      
      // Send error response
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Internal server error',
      });
    });
  };
};

