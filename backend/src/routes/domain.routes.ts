import { Router, Response } from 'express';
import { AuthenticatedRequest, resolveAuth } from '../middleware/auth.middleware.js';
import { AnalyticsService } from '../services/analytics.service.js';
import { PlatformService } from '../services/platform.service.js';
import { getDb } from '../db/database.js';

const router = Router();
const analyticsService = new AnalyticsService();
const platformService = new PlatformService();

router.use(resolveAuth);

/**
 * GET /api/users - Get current user profile and settings
 */
router.get('/users', (req: AuthenticatedRequest, res: Response) => {
  const db = getDb();
  const userId = req.userId || 'user_default';
  const user = db.prepare('SELECT id, name, email, headline, created_at, updated_at FROM users WHERE id = ?').get(userId);
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  res.json({ success: true, data: { user, settings } });
});

/**
 * GET /api/users/profile - Alias for profile
 */
router.get('/users/profile', (req: AuthenticatedRequest, res: Response) => {
  const db = getDb();
  const userId = req.userId || 'user_default';
  const user = db.prepare('SELECT id, name, email, headline, created_at, updated_at FROM users WHERE id = ?').get(userId);
  const settings = db.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
  res.json({ success: true, data: { user, settings } });
});

/**
 * GET /api/streaks - Dedicated streak & consistency metrics
 */
router.get('/streaks', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'user_default';
    const overview = analyticsService.getDashboardOverview(userId);
    res.json({
      success: true,
      data: {
        current_streak: overview.current_streak || 0,
        longest_streak: overview.longest_streak || 0,
        active_days: overview.active_days || 0,
        total_submissions: overview.total_submissions || 0,
        has_data: overview.has_data,
        last_synced_at: overview.last_synced_at
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/progress - Dedicated progress timeline & cumulative growth
 */
router.get('/progress', (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'user_default';
    const period = (req.query.period as string) || '30d';
    const timeline = analyticsService.getProblemsSolvedHistory(userId, period);
    const difficulty = analyticsService.getDifficultyDistribution(userId);
    res.json({
      success: true,
      data: {
        period,
        timeline,
        difficulty
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/leetcode - Direct LeetCode platform metrics
 */
router.get('/leetcode', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'user_default';
    const platforms = await platformService.getPlatformAccountsWithStats(userId);
    const leetcode = platforms.find(p => p.platform === 'leetcode') || null;
    res.json({ success: true, data: leetcode });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/codechef - Direct CodeChef platform metrics
 */
router.get('/codechef', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'user_default';
    const platforms = await platformService.getPlatformAccountsWithStats(userId);
    const codechef = platforms.find(p => p.platform === 'codechef') || null;
    res.json({ success: true, data: codechef });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/gfg - Direct GeeksforGeeks platform metrics
 */
router.get('/gfg', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'user_default';
    const platforms = await platformService.getPlatformAccountsWithStats(userId);
    const gfg = platforms.find(p => p.platform === 'geeksforgeeks') || null;
    res.json({ success: true, data: gfg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/codeforces - Direct Codeforces platform metrics
 */
router.get('/codeforces', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId || 'user_default';
    const platforms = await platformService.getPlatformAccountsWithStats(userId);
    const codeforces = platforms.find(p => p.platform === 'codeforces') || null;
    res.json({ success: true, data: codeforces });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/github - GitHub integration & status
 * Queries public GitHub user events or OAuth credentials if configured
 */
router.get('/github', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const username = (req.query.username as string) || process.env.GITHUB_USERNAME;
    const clientId = process.env.GITHUB_CLIENT_ID;
    
    if (!username && !clientId) {
      res.json({
        success: true,
        data: {
          configured: false,
          oauth_supported: !!clientId,
          message: 'Provide ?username=<handle> or set GITHUB_CLIENT_ID in environment variables'
        }
      });
      return;
    }

    if (username) {
      // Real public GitHub API query
      const ghRes = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: {
          'User-Agent': 'CodePulse-App',
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!ghRes.ok) {
        res.json({
          success: true,
          data: {
            configured: true,
            username,
            connected: false,
            error: `GitHub user ${username} not found (${ghRes.status})`
          }
        });
        return;
      }

      const ghData = (await ghRes.json()) as any;
      res.json({
        success: true,
        data: {
          configured: true,
          connected: true,
          username: ghData.login,
          profile_url: ghData.html_url,
          public_repos: ghData.public_repos,
          followers: ghData.followers,
          avatar_url: ghData.avatar_url,
          bio: ghData.bio
        }
      });
      return;
    }

    res.json({
      success: true,
      data: {
        configured: true,
        oauth_supported: true,
        login_url: `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=read:user`
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
