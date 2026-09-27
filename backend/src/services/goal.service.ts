import { getDb } from '../db/database.js';
import { Goal, PlatformType } from '../types/index.js';
import crypto from 'crypto';

export class GoalService {
  getGoals(userId: string): Goal[] {
    const db = getDb();
    const rawGoals = db.prepare(`
      SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC
    `).all(userId) as any[];

    const todayStr = new Date().toISOString().split('T')[0];

    return rawGoals.map(g => {
      let current = 0;

      if (g.goal_type === 'problems_solved') {
        let query = `
          SELECT SUM(ar.problems_solved) as total FROM activity_records ar
          JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
          WHERE ar.user_id = ? AND ar.activity_date >= ? AND ar.activity_date <= ?
        `;
        const params: any[] = [userId, g.start_date, g.end_date];
        if (g.platform) {
          query += ' AND ar.platform = ?';
          params.push(g.platform);
        }
        const res = db.prepare(query).get(...params) as { total: number | null };
        current = res?.total || 0;
      } else if (g.goal_type === 'active_days') {
        let query = `
          SELECT COUNT(DISTINCT ar.activity_date) as cnt FROM activity_records ar
          JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
          WHERE ar.user_id = ? AND ar.activity_date >= ? AND ar.activity_date <= ? AND (ar.problems_solved > 0 OR ar.submissions > 0)
        `;
        const params: any[] = [userId, g.start_date, g.end_date];
        if (g.platform) {
          query += ' AND ar.platform = ?';
          params.push(g.platform);
        }
        const res = db.prepare(query).get(...params) as { cnt: number };
        current = res?.cnt || 0;
      } else if (g.goal_type === 'contest_rating') {
        let query = `
          SELECT MAX(ss.rating) as max_rating FROM stat_snapshots ss
          JOIN platform_accounts pa ON pa.id = ss.platform_account_id AND pa.connection_status = 'connected'
          WHERE ss.user_id = ? AND ss.recorded_at >= ?
        `;
        const params: any[] = [userId, g.start_date];
        if (g.platform) {
          query += ' AND ss.platform = ?';
          params.push(g.platform);
        }
        const res = db.prepare(query).get(...params) as { max_rating: number | null };
        current = res?.max_rating || 0;
      } else if (g.goal_type === 'contest_count') {
        let query = `
          SELECT COUNT(DISTINCT cr.contest_id) as cnt
          FROM contest_results cr
          JOIN contests c ON cr.contest_id = c.id
          JOIN platform_accounts pa ON pa.user_id = cr.user_id AND pa.platform = c.platform AND pa.connection_status = 'connected'
          WHERE cr.user_id = ? AND c.contest_date >= ? AND c.contest_date <= ?
        `;
        const params: any[] = [userId, g.start_date, g.end_date];
        if (g.platform) {
          query += ' AND c.platform = ?';
          params.push(g.platform);
        }
        const res = db.prepare(query).get(...params) as { cnt: number };
        current = res?.cnt || 0;
      }

      const target = Number(g.target) || 1;
      const progressPercentage = Math.min(100, Math.round((current / target) * 100));

      let status = g.status;
      if (current >= target) {
        status = 'completed';
      } else if (g.end_date < todayStr) {
        status = 'expired';
      }

      return {
        id: g.id,
        user_id: g.user_id,
        title: g.title,
        goal_type: g.goal_type,
        target,
        platform: g.platform as PlatformType | null,
        start_date: g.start_date,
        end_date: g.end_date,
        status,
        current,
        progress_percentage: progressPercentage,
        created_at: g.created_at,
        updated_at: g.updated_at
      };
    });
  }

  createGoal(userId: string, data: {
    title: string;
    goal_type: string;
    target: number;
    platform?: string | null;
    start_date: string;
    end_date: string;
  }): Goal {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO goals (
        id, user_id, title, goal_type, target, platform,
        start_date, end_date, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?)
    `).run(
      id, userId, data.title, data.goal_type, data.target,
      data.platform || null, data.start_date, data.end_date, now, now
    );

    const goals = this.getGoals(userId);
    return goals.find(g => g.id === id)!;
  }

  deleteGoal(userId: string, goalId: string): boolean {
    const db = getDb();
    const info = db.prepare(`DELETE FROM goals WHERE id = ? AND user_id = ?`).run(goalId, userId);
    return info.changes > 0;
  }
}
