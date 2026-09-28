import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}`;

  // Log error securely server-side
  console.error(`[Error] [${requestId}] ${req.method} ${req.originalUrl}:`, err.stack || err.message || err);

  res.status(statusCode).json({
    success: false,
    error: isProduction && statusCode === 500
      ? 'An unexpected error occurred. Please try again later.'
      : err.message || 'Internal server error',
    request_id: requestId,
    ...(isProduction ? {} : { stack: err.stack })
  });
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({
    success: false,
    error: `Cannot ${req.method} ${req.originalUrl}`
  });
}
