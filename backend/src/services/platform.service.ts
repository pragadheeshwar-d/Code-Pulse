import { getDb } from '../db/database.js';
import { getCollector } from '../collectors/index.js';
import { SyncService } from './sync.service.js';
import { PlatformType, PlatformAccount, StatSnapshot } from '../types/index.js';
import crypto from 'crypto';

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
  private syncService = new SyncService();

  async connectPlatform(userId: string, platform: PlatformType, usernameOrUrl: string): Promise<{ account: PlatformAccount; syncResult: any }> {
    const trimmedUsername = extractUsername(platform, usernameOrUrl);
    if (!trimmedUsername) {
      throw new Error(`Please provide a valid profile link or username for ${platform}`);
    }

    const collector = getCollector(platform);
    const isValid = await collector.validateUsername(trimmedUsername);
    if (!isValid) {
      throw new Error(`Could not verify username '${trimmedUsername}' on ${platform}. Please check the profile link or spelling.`);
    }

    const db = getDb();
    const now = new Date().toISOString();
    const existing = db.prepare(`
      SELECT * FROM platform_accounts WHERE user_id = ? AND platform = ?
    `).get(userId, platform) as PlatformAccount | undefined;

    let accountId: string;
    const profileUrl = getCanonicalProfileUrl(platform, trimmedUsername);

    if (existing) {
      accountId = existing.id;
      db.prepare(`
        UPDATE platform_accounts
        SET username = ?,
            profile_url = ?,
            connection_status = 'connected',
            last_error = NULL,
            updated_at = ?
        WHERE id = ?
      `).run(trimmedUsername, profileUrl, now, accountId);
    } else {
      accountId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO platform_accounts (
          id, user_id, platform, username, profile_url, connection_status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, 'connected', ?, ?)
      `).run(accountId, userId, platform, trimmedUsername, profileUrl, now, now);
    }

    // Trigger initial sync immediately
    const syncResult = await this.syncService.syncPlatform(userId, platform);

    const account = db.prepare(`SELECT * FROM platform_accounts WHERE id = ?`).get(accountId) as unknown as PlatformAccount;
    return { account, syncResult };
  }

  async disconnectPlatform(userId: string, platform: PlatformType): Promise<boolean> {
    const db = getDb();
    const account = db.prepare(`
      SELECT id FROM platform_accounts WHERE user_id = ? AND platform = ?
    `).get(userId, platform) as { id: string } | undefined;

    if (!account) return false;

    // Delete all records associated with this user and platform
    db.prepare(`
      DELETE FROM contest_results
      WHERE user_id = ? AND contest_id IN (SELECT id FROM contests WHERE platform = ?)
    `).run(userId, platform);

    db.prepare(`
      DELETE FROM activity_records WHERE user_id = ? AND platform = ?
    `).run(userId, platform);

    db.prepare(`
      DELETE FROM user_problems
      WHERE user_id = ? AND problem_id IN (SELECT id FROM problems WHERE platform = ?)
    `).run(userId, platform);

    db.prepare(`
      DELETE FROM stat_snapshots WHERE user_id = ? AND platform = ?
    `).run(userId, platform);

    db.prepare(`
      DELETE FROM sync_logs WHERE user_id = ? AND platform = ?
    `).run(userId, platform);

    db.prepare(`DELETE FROM platform_accounts WHERE id = ?`).run(account.id);
    return true;
  }

  async getPlatformAccountsWithStats(userId: string) {
    const db = getDb();
    const platforms: PlatformType[] = ['leetcode', 'codechef', 'geeksforgeeks', 'codeforces'];

    const accounts = db.prepare(`
      SELECT * FROM platform_accounts WHERE user_id = ?
    `).all(userId) as unknown as PlatformAccount[];

    const accountMap = new Map<PlatformType, PlatformAccount>();
    for (const acc of accounts) {
      accountMap.set(acc.platform, acc);
    }

    return platforms.map(platform => {
      const acc = accountMap.get(platform);
      if (!acc) {
        return {
          platform,
          connected: false,
          username: null,
          profile_url: null,
          last_synced_at: null,
          connection_status: 'not_connected',
          stats: null
        };
      }

      // Get latest snapshot for this account
      const latestSnapshot = db.prepare(`
        SELECT * FROM stat_snapshots
        WHERE platform_account_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
      `).get(acc.id) as StatSnapshot | undefined;

      let currentStreak = latestSnapshot?.current_streak || 0;
      let longestStreak = latestSnapshot?.longest_streak || 0;

      const accDates = db.prepare(`
        SELECT DISTINCT activity_date FROM activity_records
        WHERE user_id = ? AND platform = ? AND (problems_solved > 0 OR submissions > 0)
        ORDER BY activity_date ASC
      `).all(userId, platform) as { activity_date: string }[];

      if (accDates && accDates.length > 0) {
        const streakCalc = calculateStreaksFromDates(accDates.map(d => d.activity_date));
        currentStreak = streakCalc.current_streak;
        longestStreak = Math.max(streakCalc.longest_streak, longestStreak);
      }

      return {
        id: acc.id,
        platform,
        connected: acc.connection_status === 'connected',
        username: acc.username,
        profile_url: acc.profile_url,
        last_synced_at: acc.last_synced_at,
        connection_status: acc.connection_status,
        last_error: acc.last_error,
        stats: latestSnapshot ? {
          total_solved: latestSnapshot.total_solved,
          easy_solved: latestSnapshot.easy_solved,
          medium_solved: latestSnapshot.medium_solved,
          hard_solved: latestSnapshot.hard_solved,
          rating: latestSnapshot.rating,
          rank: latestSnapshot.rank,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          total_submissions: latestSnapshot.total_submissions,
          active_days: latestSnapshot.active_days,
          recorded_at: latestSnapshot.recorded_at
        } : null
      };
    });
  }
}
