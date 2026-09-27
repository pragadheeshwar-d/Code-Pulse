import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { PlatformService } from '../services/platform.service.js';
import { SyncService } from '../services/sync.service.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { GoalService } from '../services/goal.service.js';
import { getDb } from '../db/database.js';
import { PlatformType } from '../types/index.js';

const router = Router();
const platformService = new PlatformService();
const syncService = new SyncService();
const analyticsService = new AnalyticsService();
const goalService = new GoalService();

// Middleware to resolve active user (default single-user mode for desktop/local dashboard)
const DEFAULT_USER_ID = 'user_default';

/**
 * GET /api/profile
 */
router.get('/profile', (req: Request, res: Response) => {
  const db = getDb();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(DEFAULT_USER_ID);
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(DEFAULT_USER_ID);
  res.json({ success: true, data: { user, settings } });
});

/**
 * PATCH /api/profile
 */
router.patch('/profile', (req: Request, res: Response) => {
  const { name, headline, email, auto_sync_interval, theme } = req.body;
  const db = getDb();
  const now = new Date().toISOString();

  if (name || headline || email) {
    db.prepare(`
      UPDATE users
      SET name = COALESCE(?, name),
          headline = COALESCE(?, headline),
          email = COALESCE(?, email),
          updated_at = ?
      WHERE id = ?
    `).run(name || null, headline || null, email || null, now, DEFAULT_USER_ID);
  }

  if (auto_sync_interval || theme) {
    db.prepare(`
      UPDATE user_settings
      SET auto_sync_interval = COALESCE(?, auto_sync_interval),
          theme = COALESCE(?, theme),
          updated_at = ?
      WHERE user_id = ?
    `).run(auto_sync_interval || null, theme || null, now, DEFAULT_USER_ID);
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(DEFAULT_USER_ID);
  const updatedSettings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(DEFAULT_USER_ID);

  res.json({ success: true, data: { user: updatedUser, settings: updatedSettings } });
});

/**
 * GET /api/platforms
 */
router.get('/platforms', async (req: Request, res: Response) => {
  try {
    const platforms = await platformService.getPlatformAccountsWithStats(DEFAULT_USER_ID);
    res.json({ success: true, data: platforms });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/platforms/connect
 */
const ConnectSchema = z.object({
  platform: z.enum(['leetcode', 'codechef', 'geeksforgeeks', 'codeforces']),
  username: z.string().min(1, 'Username is required').max(100)
});

router.post('/platforms/connect', async (req: Request, res: Response) => {
  try {
    const validated = ConnectSchema.parse(req.body);
    const result = await platformService.connectPlatform(DEFAULT_USER_ID, validated.platform, validated.username);
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/platforms/:platform
 */
router.delete('/platforms/:platform', async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform as PlatformType;
    const removed = await platformService.disconnectPlatform(DEFAULT_USER_ID, platform);
    res.json({ success: true, data: { removed } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/sync
 */
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const results = await syncService.syncAll(DEFAULT_USER_ID);
    res.json({ success: true, data: results });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/sync/:platform
 */
router.post('/sync/:platform', async (req: Request, res: Response) => {
  try {
    const platform = req.params.platform as PlatformType;
    const result = await syncService.syncPlatform(DEFAULT_USER_ID, platform);
    if (!result.success) {
      res.status(400).json({ success: false, error: result.error });
      return;
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/stats
 */
router.get('/stats', (req: Request, res: Response) => {
  try {
    const overview = analyticsService.getDashboardOverview(DEFAULT_USER_ID);
    res.json({ success: true, data: overview });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/stats/history
 */
router.get('/stats/history', (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || '30d';
    const history = analyticsService.getProblemsSolvedHistory(DEFAULT_USER_ID, period);
    res.json({ success: true, data: history });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/problems
 */
router.get('/problems', (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string, 10) || 50;
    const problems = analyticsService.getRecentActivity(DEFAULT_USER_ID, limit);
    res.json({ success: true, data: problems });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/activity
 */
router.get('/activity', (req: Request, res: Response) => {
  try {
    const platform = req.query.platform as string | undefined;
    const activity = analyticsService.getCodingActivity(DEFAULT_USER_ID, platform);
    res.json({ success: true, data: activity });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/goals
 */
router.get('/goals', (req: Request, res: Response) => {
  try {
    const goals = goalService.getGoals(DEFAULT_USER_ID);
    res.json({ success: true, data: goals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/goals
 */
const GoalSchema = z.object({
  title: z.string().min(1, 'Goal title is required'),
  goal_type: z.enum(['problems_solved', 'active_days', 'contest_rating', 'contest_count', 'platform_solved']),
  target: z.number().positive('Target must be positive'),
  platform: z.enum(['leetcode', 'codechef', 'geeksforgeeks', 'codeforces']).optional().nullable(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be YYYY-MM-DD'),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be YYYY-MM-DD')
});

router.post('/goals', (req: Request, res: Response) => {
  try {
    const validated = GoalSchema.parse(req.body);
    const created = goalService.createGoal(DEFAULT_USER_ID, validated);
    res.json({ success: true, data: created });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/goals/:id
 */
router.delete('/goals/:id', (req: Request, res: Response) => {
  try {
    const deleted = goalService.deleteGoal(DEFAULT_USER_ID, req.params.id);
    res.json({ success: true, data: { deleted } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/contests
 */
router.get('/contests', (req: Request, res: Response) => {
  try {
    const contests = analyticsService.getContests(DEFAULT_USER_ID);
    res.json({ success: true, data: contests });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/analytics
 */
router.get('/analytics', (req: Request, res: Response) => {
  try {
    const difficulty = analyticsService.getDifficultyDistribution(DEFAULT_USER_ID);
    const topics = analyticsService.getTopicDistribution(DEFAULT_USER_ID);
    const insights = analyticsService.getSmartInsights(DEFAULT_USER_ID);

    res.json({
      success: true,
      data: {
        difficulty,
        topics,
        insights
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/sync-logs
 */
router.get('/sync-logs', (req: Request, res: Response) => {
  try {
    const db = getDb();
    const logs = db.prepare(`
      SELECT * FROM sync_logs WHERE user_id = ? ORDER BY started_at DESC LIMIT 50
    `).all(DEFAULT_USER_ID);
    res.json({ success: true, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
