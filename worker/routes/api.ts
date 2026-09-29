import { Hono } from 'hono';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { PlatformService } from '../services/platform';
import { SyncService } from '../services/sync';
import { AnalyticsService } from '../services/analytics';
import { GoalService } from '../services/goal';
import type { AppEnv } from '../types';

const app = new Hono<AppEnv>();

app.use('*', requireAuth);

const GoalSchema = z.object({
  title: z.string().min(1),
  goal_type: z.enum(['problems_solved', 'active_days', 'contest_rating', 'contest_count', 'platform_solved']),
  target: z.number().positive(),
  platform: z.enum(['leetcode', 'codechef', 'geeksforgeeks', 'codeforces']).optional().nullable(),
  start_date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/),
  end_date: z.string().regex(/^\\d{4}-\\d{2}-\\d{2}$/)
});

app.get('/profile', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const user = await db.prepare(
    `SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?`
  ).bind(userId).first();
  const settings = await db.prepare(
    `SELECT id, user_id, auto_sync_interval, theme, notifications_enabled, updated_at FROM user_settings WHERE user_id = ?`
  ).bind(userId).first();
  return c.json({ success: true, data: { user, settings } });
});

app.patch('/profile', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const db = c.env.DB;
  const now = new Date().toISOString();
  
  if (body.name || body.email) {
    await db.prepare('UPDATE users SET name = COALESCE(?, name), email = COALESCE(?, email), updated_at = ? WHERE id = ?').bind(body.name || null, body.email || null, now, userId).run();
  }
  
  if (body.settings || body.auto_sync_interval || body.theme || body.notifications_enabled !== undefined) {
    const s = body.settings || body;
    await db.prepare(
      `INSERT INTO user_settings (id, user_id, auto_sync_interval, theme, notifications_enabled, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?) 
       ON CONFLICT(user_id) DO UPDATE SET 
       auto_sync_interval = COALESCE(excluded.auto_sync_interval, user_settings.auto_sync_interval), 
       theme = COALESCE(excluded.theme, user_settings.theme), 
       notifications_enabled = COALESCE(excluded.notifications_enabled, user_settings.notifications_enabled), 
       updated_at = excluded.updated_at`
    ).bind(crypto.randomUUID(), userId, s.auto_sync_interval || '12h', s.theme || 'dark', s.notifications_enabled !== undefined ? s.notifications_enabled : 1, now).run();
  }
  
  const updatedUser = await db.prepare('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?').bind(userId).first();
  const updatedSettings = await db.prepare('SELECT id, user_id, auto_sync_interval, theme, notifications_enabled, updated_at FROM user_settings WHERE user_id = ?').bind(userId).first();

  return c.json({ success: true, data: { user: updatedUser, settings: updatedSettings } });
});

app.get('/platforms', async (c) => {
  const userId = c.get('userId');
  const platformService = new PlatformService(c.env.DB);
  const data = await platformService.getPlatformAccountsWithStats(userId);
  return c.json({ success: true, data });
});

app.post('/platforms/connect', async (c) => {
  try {
    const userId = c.get('userId');
    const { platform, username } = await c.req.json();
    if (!platform || !username) {
      return c.json({ success: false, error: 'Platform and username are required' }, 400);
    }
    const cleanUsername = String(username).trim();
    const platformService = new PlatformService(c.env.DB);
    const data = await platformService.connectPlatform(userId, platform as any, cleanUsername);
    return c.json({ success: true, data });
  } catch (err: any) {
    return c.json({ 
      success: false, 
      error: err.message || 'Failed to connect platform account' 
    }, 400);
  }
});

app.delete('/platforms/:platform', async (c) => {
  const userId = c.get('userId');
  const platform = c.req.param('platform');
  const platformService = new PlatformService(c.env.DB);
  await platformService.disconnectPlatform(userId, platform);
  return c.json({ success: true, data: { message: 'Disconnected successfully' } });
});

app.post('/sync', async (c) => {
  const userId = c.get('userId');
  const syncService = new SyncService(c.env.DB);
  const data = await syncService.syncAll(userId);
  return c.json({ success: true, data });
});

app.post('/sync/:platform', async (c) => {
  const userId = c.get('userId');
  const platform = c.req.param('platform');
  const syncService = new SyncService(c.env.DB);
  const data = await syncService.syncPlatform(userId, platform);
  return c.json({ success: true, data });
});

app.get('/stats', async (c) => {
  const userId = c.get('userId');
  const analyticsService = new AnalyticsService(c.env.DB);
  const data = await analyticsService.getDashboardOverview(userId);
  return c.json({ success: true, data });
});

app.get('/stats/history', async (c) => {
  const userId = c.get('userId');
  const period = c.req.query('period') || '30d';
  const analyticsService = new AnalyticsService(c.env.DB);
  const data = await analyticsService.getProblemsSolvedHistory(userId, period);
  return c.json({ success: true, data });
});

app.get('/problems', async (c) => {
  const userId = c.get('userId');
  const limit = parseInt(c.req.query('limit') || '50', 10);
  const analyticsService = new AnalyticsService(c.env.DB);
  const data = await analyticsService.getRecentActivity(userId, limit);
  return c.json({ success: true, data });
});

app.get('/activity', async (c) => {
  const userId = c.get('userId');
  const platform = c.req.query('platform');
  const analyticsService = new AnalyticsService(c.env.DB);
  const data = await analyticsService.getCodingActivity(userId, platform);
  return c.json({ success: true, data });
});

app.get('/goals', async (c) => {
  const userId = c.get('userId');
  const goalService = new GoalService(c.env.DB);
  const data = await goalService.getGoals(userId);
  return c.json({ success: true, data });
});

app.post('/goals', async (c) => {
  const userId = c.get('userId');
  const body = await c.req.json();
  const parsed = GoalSchema.safeParse(body);
  
  if (!parsed.success) {
    return c.json({ success: false, error: 'Invalid input', details: parsed.error.format() }, 400);
  }
  
  const goalService = new GoalService(c.env.DB);
  const data = await goalService.createGoal(userId, parsed.data as any);
  return c.json({ success: true, data }, 201);
});

app.delete('/goals/:id', async (c) => {
  const userId = c.get('userId');
  const id = c.req.param('id');
  const goalService = new GoalService(c.env.DB);
  await goalService.deleteGoal(userId, id);
  return c.json({ success: true, data: { message: 'Goal deleted' } });
});

app.get('/contests', async (c) => {
  const userId = c.get('userId');
  const analyticsService = new AnalyticsService(c.env.DB);
  const data = await analyticsService.getContests(userId);
  return c.json({ success: true, data });
});

app.get('/analytics', async (c) => {
  const userId = c.get('userId');
  const analyticsService = new AnalyticsService(c.env.DB);
  
  const [difficulty, topics, insights] = await Promise.all([
    analyticsService.getDifficultyDistribution(userId),
    analyticsService.getTopicDistribution(userId),
    analyticsService.getSmartInsights(userId)
  ]);
  
  return c.json({ 
    success: true, 
    data: { difficulty, topics, insights } 
  });
});

app.get('/sync-logs', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const { results } = await db.prepare(
    'SELECT * FROM sync_logs WHERE user_id = ? ORDER BY started_at DESC LIMIT 50'
  ).bind(userId).all();
  return c.json({ success: true, data: results });
});

export default app;
