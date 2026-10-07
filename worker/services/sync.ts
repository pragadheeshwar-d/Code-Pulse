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
        const problemId = `${platform}_${p.external_id}`;
        problemStmts.push(this.db.prepare(`
          INSERT INTO problems (id, platform, external_problem_id, title, slug, url, difficulty, topic, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT (platform, external_problem_id) DO UPDATE SET
            title = excluded.title,
            slug = excluded.slug,
            url = excluded.url,
            difficulty = excluded.difficulty,
            topic = COALESCE(excluded.topic, problems.topic)
        `).bind(
          problemId, platform, p.external_id, p.title, p.slug || null, p.url || null, p.difficulty, p.topic || null
        ));

        const userProblemId = `${userId}_${problemId}`;
        problemStmts.push(this.db.prepare(`
          INSERT INTO user_problems (id, user_id, problem_id, solved_at, first_seen_at)
          VALUES (?, ?, ?, ?, datetime('now'))
          ON CONFLICT (user_id, problem_id) DO UPDATE SET
            solved_at = excluded.solved_at
        `).bind(
          userProblemId, userId, problemId, p.solved_at
        ));
      }
      
      const MAX_BATCH_SIZE = 50;
      for (let i = 0; i < problemStmts.length; i += MAX_BATCH_SIZE) {
        await this.db.batch(problemStmts.slice(i, i + MAX_BATCH_SIZE));
      }

      const activityStmts = [];
      for (const a of data.activities) {
        const actId = `${userId}_${platform}_${a.activity_date}`;
        activityStmts.push(this.db.prepare(`
          INSERT INTO activity_records (id, user_id, platform, activity_date, problems_solved, submissions, rating_change)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT (user_id, platform, activity_date) DO UPDATE SET
            problems_solved = MAX(activity_records.problems_solved, excluded.problems_solved),
            submissions = MAX(activity_records.submissions, excluded.submissions),
            rating_change = COALESCE(excluded.rating_change, activity_records.rating_change)
        `).bind(
          actId, userId, platform, a.activity_date, a.problems_solved, a.submissions, a.rating_change || null
        ));
      }
      for (let i = 0; i < activityStmts.length; i += MAX_BATCH_SIZE) {
        await this.db.batch(activityStmts.slice(i, i + MAX_BATCH_SIZE));
      }

      const contestStmts = [];
      for (const c of data.contests) {
        const contestId = `${platform}_${c.external_contest_id}`;
        contestStmts.push(this.db.prepare(`
          INSERT INTO contests (id, platform, external_contest_id, name, contest_date, url)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT (platform, external_contest_id) DO UPDATE SET
            name = excluded.name,
            contest_date = excluded.contest_date,
            url = excluded.url
        `).bind(
          contestId, platform, c.external_contest_id, c.name, c.contest_date, c.url || null
        ));

        const contestResultId = `${userId}_${contestId}`;
        contestStmts.push(this.db.prepare(`
          INSERT INTO contest_results (id, user_id, contest_id, rank, problems_solved, rating_before, rating_after, rating_change, recorded_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
          ON CONFLICT (user_id, contest_id) DO UPDATE SET
            rank = excluded.rank,
            problems_solved = excluded.problems_solved,
            rating_before = excluded.rating_before,
            rating_after = excluded.rating_after,
            rating_change = excluded.rating_change
        `).bind(
          contestResultId, userId, contestId, c.rank || null, c.problems_solved || null, c.rating_before || null, c.rating_after || null, c.rating_change || null
        ));
      }
      for (let i = 0; i < contestStmts.length; i += MAX_BATCH_SIZE) {
        await this.db.batch(contestStmts.slice(i, i + MAX_BATCH_SIZE));
      }

      if (data.topics) {
        const topicStmts = [];
        for (const [topic, count] of Object.entries(data.topics)) {
          if (count > 0) {
            const topicId = `${userId}_${platform}_${topic}`;
            topicStmts.push(this.db.prepare(`
              INSERT INTO platform_topics (id, user_id, platform, topic, problem_count, updated_at)
              VALUES (?, ?, ?, ?, ?, datetime('now'))
              ON CONFLICT (user_id, platform, topic) DO UPDATE SET
                problem_count = excluded.problem_count,
                updated_at = datetime('now')
            `).bind(topicId, userId, platform, topic, count));
          }
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
      try {
        const res = await this.syncPlatform(userId, acc.platform);
        results.push({ platform: acc.platform, ...res });
      } catch (err: any) {
        results.push({ platform: acc.platform, success: false, error: err.message || 'Sync failed' });
      }
    }
    
    return results;
  }
}
