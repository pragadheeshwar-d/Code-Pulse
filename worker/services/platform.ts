import { D1Database } from '@cloudflare/workers-types';
import { PlatformType, PlatformAccount } from '../types';
import { getCollector } from '../collectors/index';
import { SyncService } from './sync';

export class PlatformService {
  constructor(private db: D1Database) {}

  async connectPlatform(userId: string, platform: PlatformType, username: string) {
    const collector = getCollector(platform);
    
    const isValid = await collector.validateUsername(username);
    if (!isValid) {
      throw new Error(`Invalid username for platform ${platform}`);
    }

    const existing = await this.db.prepare(`
      SELECT id FROM platform_accounts WHERE user_id = ? AND platform = ?
    `).bind(userId, platform).first<{ id: string }>();

    let accountId = '';

    if (existing) {
      accountId = existing.id;
      await this.db.prepare(`
        UPDATE platform_accounts 
        SET username = ?, connection_status = 'connected', updated_at = datetime('now')
        WHERE id = ?
      `).bind(username, accountId).run();
    } else {
      accountId = crypto.randomUUID();
      await this.db.prepare(`
        INSERT INTO platform_accounts (id, user_id, platform, username, profile_url, connection_status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 'connected', datetime('now'), datetime('now'))
      `).bind(accountId, userId, platform, username, `https://${platform}.com/${username}`).run();
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
        `).bind(acc.id).first();
        
        results.push({
          platform: p,
          connected: true,
          username: acc.username,
          last_synced_at: acc.last_synced_at,
          stats: snap || null
        });
      } else {
        results.push({
          platform: p,
          connected: false
        });
      }
    }
    
    return results;
  }
}
