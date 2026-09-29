import { D1Database } from '@cloudflare/workers-types';
import { PlatformType } from '../types';
import { getCollector } from '../collectors/index';

export class SyncService {
  constructor(private db: D1Database) {}

  async syncPlatform(userId: string, platform: PlatformType) {
    const existingLock = await this.db.prepare(`
      SELECT id FROM sync_logs 
      WHERE user_id = ? AND platform = ? AND status = 'in_progress' AND started_at > datetime('now', '-5 minutes')
    `).bind(userId, platform).first<{ id: string }>();

    if (existingLock) {
      return { success: false, error: 'Sync already in progress' };
    }

    const logId = crypto.randomUUID();
    await this.db.prepare(`
      INSERT INTO sync_logs (id, user_id, platform, status, started_at)
      VALUES (?, ?, ?, 'in_progress', datetime('now'))
    `).bind(logId, userId, platform).run();

    try {
      const account = await this.db.prepare(`
        SELECT id, username FROM platform_accounts WHERE user_id = ? AND platform = ? AND connection_status = 'connected'
      `).bind(userId, platform).first<{ id: string; username: string }>();

      if (!account) {
        throw new Error(`Account not found or not connected for ${platform}`);
      }

      const collector = getCollector(platform);
      const data = await collector.fetchProfile(account.username);

      const snapshotId = crypto.randomUUID();
      await this.db.prepare(`
        INSERT INTO stat_snapshots (
          id, platform_account_id, user_id, platform, total_solved, easy_solved, medium_solved, hard_solved, 
          rating, rank, current_streak, longest_streak, total_submissions, active_days, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        snapshotId, account.id, userId, platform, data.total_solved, data.easy_solved, data.medium_solved, data.hard_solved,
        data.rating, data.rank, data.current_streak, data.longest_streak, data.total_submissions, data.active_days
      ).run();

      const problemStmts = [];
      for (const p of data.recent_problems) {
        problemStmts.push(this.db.prepare(`
          INSERT INTO problems (id, user_id, platform, external_id, title, slug, url, difficulty, topic, solved_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (user_id, platform, external_id) DO UPDATE SET
            title = excluded.title, difficulty = excluded.difficulty, topic = excluded.topic, solved_at = excluded.solved_at
        `).bind(
          crypto.randomUUID(), userId, platform, p.external_id, p.title, p.slug || null, p.url || null, p.difficulty, p.topic || null, p.solved_at
        ));
      }
      
      const MAX_BATCH_SIZE = 50;
      for (let i = 0; i < problemStmts.length; i += MAX_BATCH_SIZE) {
        await this.db.batch(problemStmts.slice(i, i + MAX_BATCH_SIZE));
      }

      const activityStmts = [];
      for (const a of data.activities) {
        activityStmts.push(this.db.prepare(`
          INSERT INTO activity_records (id, user_id, platform, activity_date, problems_solved, submissions, rating_change)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (user_id, platform, activity_date) DO UPDATE SET
            problems_solved = excluded.problems_solved, submissions = excluded.submissions, rating_change = excluded.rating_change
        `).bind(
          crypto.randomUUID(), userId, platform, a.activity_date, a.problems_solved, a.submissions, a.rating_change || null
        ));
      }
      for (let i = 0; i < activityStmts.length; i += MAX_BATCH_SIZE) {
        await this.db.batch(activityStmts.slice(i, i + MAX_BATCH_SIZE));
      }

      const contestStmts = [];
      for (const c of data.contests) {
        contestStmts.push(this.db.prepare(`
          INSERT INTO contests (id, user_id, platform, external_contest_id, name, contest_date, url, rank, problems_solved, rating_before, rating_after, rating_change)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (user_id, platform, external_contest_id) DO UPDATE SET
            name = excluded.name, rank = excluded.rank, rating_after = excluded.rating_after
        `).bind(
          crypto.randomUUID(), userId, platform, c.external_contest_id, c.name, c.contest_date, c.url || null, c.rank || null, c.problems_solved || null, c.rating_before || null, c.rating_after || null, c.rating_change || null
        ));
      }
      for (let i = 0; i < contestStmts.length; i += MAX_BATCH_SIZE) {
        await this.db.batch(contestStmts.slice(i, i + MAX_BATCH_SIZE));
      }

      if (data.topics) {
        const topicStmts = [];
        for (const [topic_name, count] of Object.entries(data.topics)) {
          topicStmts.push(this.db.prepare(`
            INSERT INTO platform_topics (id, user_id, platform, topic_name, problems_count)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT (user_id, platform, topic_name) DO UPDATE SET
              problems_count = excluded.problems_count
          `).bind(crypto.randomUUID(), userId, platform, topic_name, count));
        }
        for (let i = 0; i < topicStmts.length; i += MAX_BATCH_SIZE) {
          await this.db.batch(topicStmts.slice(i, i + MAX_BATCH_SIZE));
        }
      }

      await this.db.prepare(`
        UPDATE platform_accounts SET last_synced_at = datetime('now') WHERE id = ?
      `).bind(account.id).run();

      await this.db.prepare(`
        UPDATE sync_logs SET status = 'completed', completed_at = datetime('now') WHERE id = ?
      `).bind(logId).run();

      return { success: true };

    } catch (error: any) {
      await this.db.prepare(`
        UPDATE sync_logs SET status = 'failed', error_message = ?, completed_at = datetime('now') WHERE id = ?
      `).bind(error.message, logId).run();
      
      await this.db.prepare(`
        UPDATE platform_accounts SET last_error = ? WHERE user_id = ? AND platform = ?
      `).bind(error.message, userId, platform).run();

      return { success: false, error: error.message };
    }
  }

  async syncAll(userId: string) {
    const { results: accounts } = await this.db.prepare(`
      SELECT platform FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'
    `).bind(userId).all<{ platform: PlatformType }>();

    const results = [];
    for (const acc of accounts) {
      const res = await this.syncPlatform(userId, acc.platform);
      results.push({ platform: acc.platform, ...res });
    }
    
    return results;
  }
}
