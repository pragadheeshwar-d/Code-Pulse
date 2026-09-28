import { getDb } from '../db/database.js';
import { getCollector } from '../collectors/index.js';
import { PlatformType, PlatformAccount, NormalizedProfileData } from '../types/index.js';
import crypto from 'crypto';

export class SyncService {
  private static activeSyncLocks = new Set<string>();

  /**
   * Sync a single platform account for a user
   */
  async syncPlatform(userId: string, platform: PlatformType): Promise<{ success: boolean; error?: string; data?: NormalizedProfileData }> {
    const lockKey = `${userId}:${platform}`;
    if (SyncService.activeSyncLocks.has(lockKey)) {
      return { success: false, error: 'Sync already in progress for this platform' };
    }

    SyncService.activeSyncLocks.add(lockKey);
    const db = getDb();
    const syncLogId = crypto.randomUUID();
    const startTime = new Date().toISOString();

    // Create in-progress sync log
    db.prepare(`
      INSERT INTO sync_logs (id, user_id, platform, status, started_at, records_processed)
      VALUES (?, ?, ?, 'in_progress', ?, 0)
    `).run(syncLogId, userId, platform, startTime);

    try {
      // Find platform account
      const account = db.prepare(`
        SELECT * FROM platform_accounts WHERE user_id = ? AND platform = ?
      `).get(userId, platform) as PlatformAccount | undefined;

      if (!account) {
        throw new Error(`Platform account for ${platform} is not connected.`);
      }

      const collector = getCollector(platform);
      const profileData = await collector.fetchProfile(account.username);

      // Save everything in a transaction
      const now = new Date().toISOString();
      let recordsProcessed = 0;

      // 1. Update platform account
      db.prepare(`
        UPDATE platform_accounts
        SET connection_status = 'connected',
            last_synced_at = ?,
            last_error = NULL,
            updated_at = ?
        WHERE id = ?
      `).run(now, now, account.id);

      // 2. Create Stat Snapshot (Mandatory historical record)
      const snapshotId = crypto.randomUUID();
      db.prepare(`
        INSERT INTO stat_snapshots (
          id, platform_account_id, user_id, platform,
          total_solved, easy_solved, medium_solved, hard_solved,
          rating, rank, current_streak, longest_streak,
          total_submissions, active_days, recorded_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        snapshotId, account.id, userId, platform,
        profileData.total_solved,
        profileData.easy_solved,
        profileData.medium_solved,
        profileData.hard_solved,
        profileData.rating,
        profileData.rank,
        profileData.current_streak,
        profileData.longest_streak,
        profileData.total_submissions,
        profileData.active_days,
        now
      );
      recordsProcessed++;

      // 3. Save Recent Problems
      for (const p of profileData.recent_problems) {
        const problemId = `${platform}_${p.external_id}`;
        db.prepare(`
          INSERT INTO problems (id, platform, external_problem_id, title, slug, url, difficulty, topic, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(platform, external_problem_id) DO UPDATE SET
            title = excluded.title,
            slug = excluded.slug,
            url = excluded.url,
            difficulty = excluded.difficulty,
            topic = COALESCE(excluded.topic, problems.topic)
        `).run(problemId, platform, p.external_id, p.title, p.slug || null, p.url || null, p.difficulty, p.topic || null, now);

        const userProblemId = `${userId}_${problemId}`;
        db.prepare(`
          INSERT INTO user_problems (id, user_id, problem_id, solved_at, first_seen_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(user_id, problem_id) DO NOTHING
        `).run(userProblemId, userId, problemId, p.solved_at, now);
        recordsProcessed++;
      }

      // 4. Save Activities
      for (const act of profileData.activities) {
        const actId = `${userId}_${platform}_${act.activity_date}`;
        db.prepare(`
          INSERT INTO activity_records (id, user_id, platform, activity_date, problems_solved, submissions, rating_change, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, platform, activity_date) DO UPDATE SET
            problems_solved = MAX(activity_records.problems_solved, excluded.problems_solved),
            submissions = MAX(activity_records.submissions, excluded.submissions),
            rating_change = COALESCE(excluded.rating_change, activity_records.rating_change)
        `).run(
          actId, userId, platform, act.activity_date,
          act.problems_solved,
          act.submissions,
          act.rating_change || 0,
          act.metadata ? JSON.stringify(act.metadata) : null
        );
        recordsProcessed++;
      }

      // 5. Save Contests
      for (const c of profileData.contests) {
        const contestId = `${platform}_${c.external_contest_id}`;
        db.prepare(`
          INSERT INTO contests (id, platform, external_contest_id, name, contest_date, url)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(platform, external_contest_id) DO UPDATE SET
            name = excluded.name,
            contest_date = excluded.contest_date,
            url = excluded.url
        `).run(contestId, platform, c.external_contest_id, c.name, c.contest_date, c.url || null);

        const contestResultId = `${userId}_${contestId}`;
        db.prepare(`
          INSERT INTO contest_results (
            id, user_id, contest_id, rank, problems_solved,
            rating_before, rating_after, rating_change, recorded_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(user_id, contest_id) DO UPDATE SET
            rank = excluded.rank,
            problems_solved = excluded.problems_solved,
            rating_before = excluded.rating_before,
            rating_after = excluded.rating_after,
            rating_change = excluded.rating_change
        `).run(
          contestResultId, userId, contestId,
          c.rank || null,
          c.problems_solved || null,
          c.rating_before || null,
          c.rating_after || null,
          c.rating_change || null,
          now
        );
        recordsProcessed++;
      }

      // 6. Save Topics
      if (profileData.topics) {
        for (const [topic, count] of Object.entries(profileData.topics)) {
          if (count > 0) {
            const topicId = `${userId}_${platform}_${topic}`;
            db.prepare(`
              INSERT INTO platform_topics (id, user_id, platform, topic, problem_count, updated_at)
              VALUES (?, ?, ?, ?, ?, ?)
              ON CONFLICT(user_id, platform, topic) DO UPDATE SET
                problem_count = excluded.problem_count,
                updated_at = excluded.updated_at
            `).run(topicId, userId, platform, topic, count, now);
            recordsProcessed++;
          }
        }
      }

      // Complete sync log
      db.prepare(`
        UPDATE sync_logs
        SET status = 'success',
            completed_at = ?,
            records_processed = ?
        WHERE id = ?
      `).run(now, recordsProcessed, syncLogId);

      return { success: true, data: profileData };
    } catch (err: any) {
      const finishTime = new Date().toISOString();
      const errorMessage = err?.message || 'Unknown sync error';

      // Update log with error
      db.prepare(`
        UPDATE sync_logs
        SET status = 'failed',
            completed_at = ?,
            error_message = ?
        WHERE id = ?
      `).run(finishTime, errorMessage, syncLogId);

      // Update account status to error without deleting previous data
      db.prepare(`
        UPDATE platform_accounts
        SET connection_status = 'error',
            last_error = ?,
            updated_at = ?
        WHERE user_id = ? AND platform = ?
      `).run(errorMessage, finishTime, userId, platform);

      return { success: false, error: errorMessage };
    } finally {
      SyncService.activeSyncLocks.delete(lockKey);
    }
  }

  /**
   * Sync all connected platforms for a user sequentially, isolating failures
   */
  async syncAll(userId: string): Promise<Record<PlatformType, { success: boolean; error?: string }>> {
    const db = getDb();
    const accounts = db.prepare(`
      SELECT platform FROM platform_accounts WHERE user_id = ?
    `).all(userId) as { platform: PlatformType }[];

    const results: Partial<Record<PlatformType, { success: boolean; error?: string }>> = {};

    for (const acc of accounts) {
      results[acc.platform] = await this.syncPlatform(userId, acc.platform);
    }

    return results as Record<PlatformType, { success: boolean; error?: string }>;
  }
}
