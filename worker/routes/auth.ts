import { Hono } from 'hono';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { signToken, requireAuth } from '../middleware/auth';
import type { AppEnv } from '../types';

const app = new Hono<AppEnv>();

const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(6),
  headline: z.string().max(200).optional()
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

app.post('/register', async (c) => {
  const body = await c.req.json();
  const parsed = RegisterSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid input', details: parsed.error.format() }, 400);
  }

  const { name, email, password, headline } = parsed.data;
  const db = c.env.DB;

  try {
    const existingUser = await db.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();
    if (existingUser) {
      return c.json({ success: false, error: 'Email already registered' }, 409);
    }

    const userId = `usr_${crypto.randomUUID()}`;
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const settingsId = `set_${userId}`;

    await db.batch([
      db.prepare(
        'INSERT INTO users (id, name, email, password_hash, headline, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).bind(userId, name, email, passwordHash, headline || 'Software Engineer', now, now),
      db.prepare(
        'INSERT INTO user_settings (id, user_id, auto_sync_interval, theme, notifications_enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?)'
      ).bind(settingsId, userId, '12h', 'dark', 1, now)
    ]);

    const token = await signToken({ userId, email, name }, c.env.JWT_SECRET);

    const user = {
      id: userId,
      name,
      email,
      settings: {
        headline: headline || null,
        theme: 'dark'
      }
    };

    return c.json({ success: true, data: { token, user } }, 201);
  } catch (error: any) {
    console.error('Register error:', error);
    return c.json({ success: false, error: 'Failed to register user' }, 500);
  }
});

app.post('/login', async (c) => {
  const body = await c.req.json();
  const parsed = LoginSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid input' }, 400);
  }

  const { email, password } = parsed.data;
  const db = c.env.DB;

  try {
    const user = await db.prepare(
      `SELECT u.id, u.name, u.email, u.password_hash, u.headline, s.theme 
       FROM users u 
       LEFT JOIN user_settings s ON u.id = s.user_id 
       WHERE u.email = ?`
    ).bind(email).first<any>();

    if (!user) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }

    const token = await signToken({ userId: user.id, email: user.email, name: user.name }, c.env.JWT_SECRET);

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      settings: {
        headline: user.headline,
        theme: user.theme
      }
    };

    return c.json({ success: true, data: { token, user: userData } });
  } catch (error: any) {
    console.error('Login error:', error);
    return c.json({ success: false, error: 'Failed to login' }, 500);
  }
});

app.get('/me', requireAuth, async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;

  try {
    const user = await db.prepare(
      'SELECT id, name, email, headline, created_at, updated_at FROM users WHERE id = ?'
    ).bind(userId).first<any>();

    if (!user) {
      return c.json({ success: false, error: 'User not found' }, 404);
    }

    const settings = await db.prepare(
      'SELECT * FROM user_settings WHERE user_id = ?'
    ).bind(userId).first<any>();

    return c.json({
      success: true,
      data: { user, settings }
    });
  } catch (error: any) {
    console.error('Me error:', error);
    return c.json({ success: false, error: 'Failed to fetch user' }, 500);
  }
});

app.post('/logout', async (c) => {
  return c.json({ success: true, data: { message: 'Logged out successfully' } });
});

export default app;
