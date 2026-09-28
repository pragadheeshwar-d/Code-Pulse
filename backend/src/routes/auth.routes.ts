import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import crypto from 'crypto';
import { getDb } from '../db/database.js';
import { AuthenticatedRequest, JWT_SECRET, requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

const RegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  headline: z.string().max(200).optional()
});

const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

/**
 * POST /api/auth/register
 */
router.post('/register', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = RegisterSchema.parse(req.body);
    const db = getDb();

    // Check if email already in use
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(validated.email);
    if (existing) {
      res.status(409).json({ success: false, error: 'An account with this email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);
    const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, headline, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, validated.name, validated.email, passwordHash, validated.headline || 'Software Engineer', now, now);

    db.prepare(`
      INSERT INTO user_settings (id, user_id, auto_sync_interval, theme, notifications_enabled, updated_at)
      VALUES (?, ?, '12h', 'dark', 1, ?)
    `).run(`set_${userId}`, userId, now);

    const token = jwt.sign(
      { userId, email: validated.email, name: validated.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const user = {
      id: userId,
      name: validated.name,
      email: validated.email,
      headline: validated.headline || 'Software Engineer',
      created_at: now,
      updated_at: now
    };

    res.status(201).json({
      success: true,
      data: {
        token,
        user
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('[AuthRegisterError]', err);
    res.status(500).json({ success: false, error: 'Registration failed. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = LoginSchema.parse(req.body);
    const db = getDb();

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(validated.email) as any;
    if (!user || !user.password_hash) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      headline: user.headline,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    res.json({
      success: true,
      data: {
        token,
        user: safeUser
      }
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ success: false, error: err.errors[0]?.message || 'Validation error' });
      return;
    }
    console.error('[AuthLoginError]', err);
    res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || '';
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, headline, created_at, updated_at FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      res.status(404).json({ success: false, error: 'User profile not found' });
      return;
    }
    const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
    res.json({ success: true, data: { user, settings } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve authenticated session' });
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req: AuthenticatedRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
