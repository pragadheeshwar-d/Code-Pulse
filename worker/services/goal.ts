import { D1Database } from '@cloudflare/workers-types';
import { Goal, PlatformType } from '../types';

export class GoalService {
  constructor(private db: D1Database) {}

  async getGoals(userId: string): Promise<Goal[]> {
    const { results: goals } = await this.db.prepare(`
      SELECT * FROM goals WHERE user_id = ? ORDER BY end_date ASC
    `).bind(userId).all<Goal>();

    const evaluatedGoals = [];
    for (const goal of goals) {
      let current = 0;

      if (goal.goal_type === 'problems_solved') {
        let platformCond = '';
        const params: any[] = [userId, goal.start_date, goal.end_date];
        if (goal.platform) {
          platformCond = 'AND platform = ?';
          params.push(goal.platform);
        }
        
        const { results } = await this.db.prepare(`
          SELECT SUM(problems_solved) as solved FROM activity_records
          WHERE user_id = ? AND activity_date >= ? AND activity_date <= ? ${platformCond}
        `).bind(...params).all<{ solved: number }>();
        
        current = results[0]?.solved || 0;
      } 
      else if (goal.goal_type === 'active_days') {
        let platformCond = '';
        const params: any[] = [userId, goal.start_date, goal.end_date];
        if (goal.platform) {
          platformCond = 'AND platform = ?';
          params.push(goal.platform);
        }

        const { results } = await this.db.prepare(`
          SELECT COUNT(DISTINCT activity_date) as days FROM activity_records
          WHERE user_id = ? AND activity_date >= ? AND activity_date <= ? AND (problems_solved > 0 OR submissions > 0) ${platformCond}
        `).bind(...params).all<{ days: number }>();

        current = results[0]?.days || 0;
      }
      else if (goal.goal_type === 'contest_rating') {
        if (goal.platform) {
          const snap = await this.db.prepare(`
            SELECT rating FROM stat_snapshots s
            JOIN platform_accounts p ON s.platform_account_id = p.id
            WHERE p.user_id = ? AND p.platform = ?
            ORDER BY recorded_at DESC LIMIT 1
          `).bind(userId, goal.platform).first<{ rating: number }>();
          
          current = snap?.rating || 0;
        }
      }
      else if (goal.goal_type === 'contest_count') {
        let platformCond = '';
        const params: any[] = [userId, goal.start_date, goal.end_date];
        if (goal.platform) {
          platformCond = 'AND platform = ?';
          params.push(goal.platform);
        }

        const { results } = await this.db.prepare(`
          SELECT COUNT(*) as count FROM contests
          WHERE user_id = ? AND contest_date >= ? AND contest_date <= ? ${platformCond}
        `).bind(...params).all<{ count: number }>();

        current = results[0]?.count || 0;
      }

      let status = goal.status;
      const progress_percentage = Math.min(Math.round((current / goal.target) * 100), 100);
      
      const now = new Date();
      const endDate = new Date(goal.end_date);
      
      if (current >= goal.target && status !== 'completed') {
        status = 'completed';
        await this.db.prepare(`UPDATE goals SET status = 'completed', updated_at = datetime('now') WHERE id = ?`).bind(goal.id).run();
      } else if (now > endDate && status === 'active' && current < goal.target) {
        status = 'failed';
        await this.db.prepare(`UPDATE goals SET status = 'failed', updated_at = datetime('now') WHERE id = ?`).bind(goal.id).run();
      }

      evaluatedGoals.push({
        ...goal,
        current,
        progress_percentage,
        status
      });
    }

    return evaluatedGoals;
  }

  async createGoal(userId: string, data: Partial<Goal>): Promise<Goal> {
    const id = crypto.randomUUID();
    
    await this.db.prepare(`
      INSERT INTO goals (id, user_id, title, goal_type, target, platform, start_date, end_date, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', datetime('now'), datetime('now'))
    `).bind(
      id,
      userId,
      data.title,
      data.goal_type,
      data.target,
      data.platform || null,
      data.start_date,
      data.end_date
    ).run();

    const goals = await this.getGoals(userId);
    return goals.find(g => g.id === id)!;
  }

  async deleteGoal(userId: string, goalId: string): Promise<boolean> {
    const { meta } = await this.db.prepare(`
      DELETE FROM goals WHERE id = ? AND user_id = ?
    `).bind(goalId, userId).run();

    return meta.changes > 0;
  }
}
