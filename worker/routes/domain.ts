import { Hono } from 'hono';
import { requireAuth } from '../middleware/auth';
import { AnalyticsService } from '../services/analytics';
import { PlatformService } from '../services/platform';
import type { AppEnv } from '../types';

const app = new Hono<AppEnv>();

app.use('*', requireAuth);

app.get('/users', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const user = await db.prepare(
    `SELECT u.id, u.name, u.email, s.theme, s.auto_sync_interval 
     FROM users u LEFT JOIN user_settings s ON u.id = s.user_id WHERE u.id = ?`
  ).bind(userId).first();
  return c.json({ success: true, data: user });
});

app.get('/users/profile', async (c) => {
  const userId = c.get('userId');
  const db = c.env.DB;
  const user = await db.prepare(
    `SELECT u.id, u.name, u.email, s.theme, s.auto_sync_interval 
     FROM users u LEFT JOIN user_settings s ON u.id = s.user_id WHERE u.id = ?`
  ).bind(userId).first();
  return c.json({ success: true, data: user });
});

app.get('/streaks', async (c) => {
  const userId = c.get('userId');
  const analyticsService = new AnalyticsService(c.env.DB);
  const overview = await analyticsService.getDashboardOverview(userId);
  return c.json({ 
    success: true, 
    data: {
      currentStreak: overview.current_streak,
      maxStreak: overview.longest_streak,
      lastActive: overview.last_synced_at
    } 
  });
});

app.get('/progress', async (c) => {
  const userId = c.get('userId');
  const analyticsService = new AnalyticsService(c.env.DB);
  const [history, difficulty] = await Promise.all([
    analyticsService.getProblemsSolvedHistory(userId, '30d'),
    analyticsService.getDifficultyDistribution(userId)
  ]);
  return c.json({ success: true, data: { history, difficulty } });
});

const getPlatformRoute = (platformName: string) => async (c: any) => {
  const userId = c.get('userId');
  const platformService = new PlatformService(c.env.DB);
  const platforms = await platformService.getPlatformAccountsWithStats(userId);
  const platform = platforms.find((p: any) => p.platform === platformName);
  
  if (!platform) {
    return c.json({ success: false, error: `Platform ${platformName} not connected` }, 404);
  }
  
  return c.json({ success: true, data: platform });
};

app.get('/leetcode', getPlatformRoute('leetcode'));
app.get('/codechef', getPlatformRoute('codechef'));
app.get('/gfg', getPlatformRoute('geeksforgeeks'));
app.get('/codeforces', getPlatformRoute('codeforces'));

app.get('/github', async (c) => {
  const username = c.req.query('username') || c.env.GITHUB_USERNAME;
  
  if (!username) {
    return c.json({ 
      success: true, 
      data: { 
        configured: false, 
        message: 'GitHub username not configured. Pass as query param or configure in environment to view GitHub stats.' 
      } 
    });
  }
  
  try {
    const clientId = c.env.GITHUB_CLIENT_ID;
    const clientSecret = c.env.GITHUB_CLIENT_SECRET;
    
    let url = `https://api.github.com/users/${username}`;
    
    const headers: Record<string, string> = {
      'User-Agent': 'CodePulse-Worker'
    };
    
    if (clientId && clientSecret) {
      const auth = btoa(`${clientId}:${clientSecret}`);
      headers['Authorization'] = `Basic ${auth}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`GitHub API returned ${response.status}`);
    }
    
    const data = await response.json();
    return c.json({ success: true, data });
  } catch (error: any) {
    console.error('GitHub fetch error:', error);
    return c.json({ success: false, error: 'Failed to fetch GitHub data' }, 500);
  }
});

export default app;
