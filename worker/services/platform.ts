import { D1Database } from '@cloudflare/workers-types';
import { PlatformType, PlatformAccount } from '../types';
import { getCollector } from '../collectors/index';
import { SyncService } from './sync';

export function extractUsername(platform: PlatformType, input: string): string {
  if (!input) return '';
  let val = input.trim();
  if (!val) return '';

  val = val.split('?')[0].split('#')[0].replace(/\/+$/, '');

  if (val.includes('/') || val.includes('.')) {
    if (platform === 'leetcode') {
      const match = val.match(/leetcode\.(?:com|cn)\/(?:u\/)?([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    } else if (platform === 'codechef') {
      const match = val.match(/codechef\.com\/users\/([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    } else if (platform === 'codeforces') {
      const match = val.match(/codeforces\.com\/profile\/([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    } else if (platform === 'geeksforgeeks') {
      const match = val.match(/geeksforgeeks\.org\/(?:profile|user)\/([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    }

    const segments = val.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1].trim();
      const reserved = ['u', 'profile', 'users', 'user', 'practice', 'leetcode', 'codechef', 'codeforces', 'geeksforgeeks', 'www'];
      if (last && !reserved.includes(last.toLowerCase())) {
        return last;
      }
    }
  }

  return val.replace(/^@+/, '').trim();
}

export function getCanonicalProfileUrl(platform: PlatformType, username: string): string {
  const handle = username.trim().replace(/^@+/, '');
  switch (platform) {
    case 'leetcode':
      return `https://leetcode.com/u/${handle}/`;
    case 'codeforces':
      return `https://codeforces.com/profile/${handle}`;
    case 'codechef':
      return `https://www.codechef.com/users/${handle}`;
    case 'geeksforgeeks':
      return `https://www.geeksforgeeks.org/profile/${handle}`;
    default:
      return `https://${platform}.com/${handle}`;
  }
}

export function calculateStreaksFromDates(sortedDateStrings: string[]): { current_streak: number; longest_streak: number } {
  if (!sortedDateStrings || sortedDateStrings.length === 0) return { current_streak: 0, longest_streak: 0 };
  
  const sorted = Array.from(new Set(sortedDateStrings)).sort();
  let longest = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];

  for (const dateStr of sorted) {
    const curDate = new Date(dateStr + 'T00:00:00Z');
    if (prevDate) {
      const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    } else {
      tempStreak = 1;
    }
    if (tempStreak > longest) longest = tempStreak;
    prevDate = curDate;
  }

  const lastDate = sorted[sorted.length - 1];
  let current = 0;
  if (lastDate === todayStr || lastDate === yesterdayStr) {
    current = tempStreak;
  }

  return { current_streak: current, longest_streak: longest };
}

export class PlatformService {
  constructor(private db: D1Database) {}

  async connectPlatform(userId: string, platform: PlatformType, usernameOrUrl: string) {
    const username = extractUsername(platform, usernameOrUrl);
    if (!username) {
      throw new Error(`Please provide a valid profile link or username for ${platform}`);
    }

    const collector = getCollector(platform);
    
    const isValid = await collector.validateUsername(username);
    if (!isValid) {
      throw new Error(`Could not verify username '${username}' on ${platform}. Please check the profile link or spelling.`);
    }

    const existing = await this.db.prepare(`
      SELECT id FROM platform_accounts WHERE user_id = ? AND platform = ?
    `).bind(userId, platform).first<{ id: string }>();

    let accountId = '';
    const profileUrl = getCanonicalProfileUrl(platform, username);

    if (existing) {
      accountId = existing.id;
      await this.db.prepare(`
        UPDATE platform_accounts 
        SET username = ?, profile_url = ?, connection_status = 'connected', last_error = NULL, updated_at = datetime('now')
        WHERE id = ?
      `).bind(username, profileUrl, accountId).run();
    } else {
      accountId = crypto.randomUUID();
      await this.db.prepare(`
        INSERT INTO platform_accounts (id, user_id, platform, username, profile_url, connection_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'connected', datetime('now'), datetime('now'))
      `).bind(accountId, userId, platform, username, profileUrl).run();
    }

    const syncService = new SyncService(this.db);
    await syncService.syncPlatform(userId, platform);

    return { success: true, message: `Connected ${platform} successfully.` };
  }

  async disconnectPlatform(userId: string, platform: PlatformType) {
    const account = await this.db.prepare(`
      SELECT id FROM platform_accounts WHERE user_id = ? AND platform = ?
    `).bind(userId, platform).first<{ id: string }>();

    if (!account) {
      throw new Error('Platform not connected');
    }

    await this.db.batch([
      this.db.prepare(`DELETE FROM stat_snapshots WHERE platform_account_id = ?`).bind(account.id),
      this.db.prepare(`DELETE FROM problems WHERE user_id = ? AND platform = ?`).bind(userId, platform),
      this.db.prepare(`DELETE FROM activity_records WHERE user_id = ? AND platform = ?`).bind(userId, platform),
      this.db.prepare(`DELETE FROM contests WHERE user_id = ? AND platform = ?`).bind(userId, platform),
      this.db.prepare(`DELETE FROM platform_topics WHERE user_id = ? AND platform = ?`).bind(userId, platform),
      this.db.prepare(`DELETE FROM platform_accounts WHERE id = ?`).bind(account.id)
    ]);

    return { success: true, message: `Disconnected ${platform} successfully.` };
  }

  async getPlatformAccountsWithStats(userId: string) {
    const platforms: PlatformType[] = ['leetcode', 'codechef', 'codeforces', 'geeksforgeeks'];
    
    const { results: accounts } = await this.db.prepare(`
      SELECT * FROM platform_accounts WHERE user_id = ?
    `).bind(userId).all<PlatformAccount>();

    const results = [];
    
    for (const p of platforms) {
      const acc = accounts.find(a => a.platform === p);
      if (acc && acc.connection_status === 'connected') {
        const snap = await this.db.prepare(`
          SELECT * FROM stat_snapshots WHERE platform_account_id = ? ORDER BY recorded_at DESC LIMIT 1
        `).bind(acc.id).first<any>();
        
        let statsObj: any = snap ? { ...snap } : null;
        if (statsObj) {
          const { results: accDates } = await this.db.prepare(`
            SELECT DISTINCT activity_date FROM activity_records 
            WHERE user_id = ? AND platform = ? AND (problems_solved > 0 OR submissions > 0)
            ORDER BY activity_date ASC
          `).bind(userId, p).all<{ activity_date: string }>();

          if (accDates && accDates.length > 0) {
            const streakCalc = calculateStreaksFromDates(accDates.map(d => d.activity_date));
            statsObj.current_streak = streakCalc.current_streak;
            statsObj.longest_streak = Math.max(streakCalc.longest_streak, statsObj.longest_streak || 0);
          }
        }

        results.push({
          id: acc.id,
          platform: p,
          connected: true,
          username: acc.username,
          profile_url: acc.profile_url || getCanonicalProfileUrl(p, acc.username),
          last_synced_at: acc.last_synced_at,
          connection_status: acc.connection_status,
          last_error: acc.last_error || null,
          stats: statsObj
        });
      } else {
        results.push({
          platform: p,
          connected: false,
          username: null,
          profile_url: null,
          last_synced_at: null,
          connection_status: 'not_connected',
          stats: null
        });
      }
    }
    
    return results;
  }
}
