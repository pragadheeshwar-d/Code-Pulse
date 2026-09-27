import { getDb } from '../db/database.js';
import { getCollector } from '../collectors/index.js';
import { SyncService } from './sync.service.js';
import { PlatformType, PlatformAccount, StatSnapshot } from '../types/index.js';
import crypto from 'crypto';

export class PlatformService {
  private syncService = new SyncService();

  async connectPlatform(userId: string, platform: PlatformType, username: string): Promise<{ account: PlatformAccount; syncResult: any }> {
    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      throw new Error('Username cannot be empty');
    }

    const collector = getCollector(platform);
    const isValid = await collector.validateUsername(trimmedUsername);
    if (!isValid) {
      throw new Error(`Could not verify username '${trimmedUsername}' on ${platform}. Please check the spelling.`);
    }

    const db = getDb();
    const now = new Date().toISOString();
    const existing = db.prepare(`
      SELECT * FROM platform_accounts WHERE user_id = ? AND platform = ?
    `).get(userId, platform) as PlatformAccount | undefined;

    let accountId: string;
    let profileUrl = '';

    switch (platform) {
      case 'leetcode':
        profileUrl = `https://leetcode.com/${trimmedUsername}/`;
        break;
      case 'codeforces':
        profileUrl = `https://codeforces.com/profile/${trimmedUsername}`;
        break;
      case 'codechef':
        profileUrl = `https://www.codechef.com/users/${trimmedUsername}`;
        break;
      case 'geeksforgeeks':
        profileUrl = `https://www.geeksforgeeks.org/profile/${trimmedUsername}`;
        break;
    }

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
          current_streak: latestSnapshot.current_streak,
          longest_streak: latestSnapshot.longest_streak,
          total_submissions: latestSnapshot.total_submissions,
          active_days: latestSnapshot.active_days,
          recorded_at: latestSnapshot.recorded_at
        } : null
      };
    });
  }
}
