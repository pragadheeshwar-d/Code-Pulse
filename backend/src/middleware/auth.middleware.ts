import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const JWT_SECRET = process.env.JWT_SECRET || 'codepulse_super_secret_jwt_key_2026_prod';
export const DEFAULT_USER_ID = 'user_default';

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    userId: string;
    email?: string;
    name?: string;
  };
}

/**
 * Extracts and verifies JWT if present; falls back to DEFAULT_USER_ID if omitted.
 * This guarantees backwards-compatibility while supporting authenticated sessions.
 */
export function resolveAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string; name?: string };
      req.userId = decoded.userId;
      req.user = decoded;
      return next();
    } catch (err) {
      // Invalid token provided
      res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
      return;
    }
  }

  // Fallback to active single-user / default profile
  req.userId = DEFAULT_USER_ID;
  next();
}

/**
 * Enforces strict authentication. Requests without a valid Bearer token will be rejected.
 */
export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required. Missing Bearer token.' });
    return;
  }

  const token = authHeader.substring(7).trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email?: string; name?: string };
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}
