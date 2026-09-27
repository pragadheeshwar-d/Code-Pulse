import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initializeDatabase } from '../src/db/schema.js';
import { getDb, closeDb } from '../src/db/database.js';
import { AnalyticsService } from '../src/services/analytics.service.js';
import { GoalService } from '../src/services/goal.service.js';

describe('Unit Tests: Core Algorithms and Logic', () => {
  beforeEach(() => {
    // In-memory or clean test db
    process.env.DATABASE_PATH = ':memory:';
    initializeDatabase();
  });

  afterEach(() => {
    closeDb();
  });

  it('Streak Calculation: accurately computes current and longest streak from date sequences', () => {
    const analytics = new AnalyticsService();
    // Test the internal calculateStreaks method
    const calculateStreaks = (analytics as any).calculateStreaks.bind(analytics);

    // Empty list
    expect(calculateStreaks([])).toEqual({ currentStreak: 0, longestStreak: 0 });

    // Consecutive dates ending yesterday/today
    const today = new Date();
    const d0 = today.toISOString().split('T')[0];
    const d1 = new Date(today.getTime() - 86400000).toISOString().split('T')[0];
    const d2 = new Date(today.getTime() - 2 * 86400000).toISOString().split('T')[0];
    const d5 = new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0];
    const d6 = new Date(today.getTime() - 6 * 86400000).toISOString().split('T')[0];
    const d7 = new Date(today.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const d8 = new Date(today.getTime() - 8 * 86400000).toISOString().split('T')[0];

    // [d8, d7, d6, d5] is a 4-day streak, [d2, d1, d0] is a 3-day active streak
    const dates = [d8, d7, d6, d5, d2, d1, d0].sort();
    const result = calculateStreaks(dates);

    expect(result.longestStreak).toBe(4);
    expect(result.currentStreak).toBe(3);
  });

  it('Streak Calculation: breaks current streak if last activity was more than 1 day ago', () => {
    const analytics = new AnalyticsService();
    const calculateStreaks = (analytics as any).calculateStreaks.bind(analytics);

    const today = new Date();
    const d3 = new Date(today.getTime() - 3 * 86400000).toISOString().split('T')[0];
    const d4 = new Date(today.getTime() - 4 * 86400000).toISOString().split('T')[0];
    const d5 = new Date(today.getTime() - 5 * 86400000).toISOString().split('T')[0];

    const result = calculateStreaks([d5, d4, d3]);
    expect(result.longestStreak).toBe(3);
    expect(result.currentStreak).toBe(0); // broken streak
  });

  it('Goal Progress Calculation: computes progress percentage dynamically from stored data', () => {
    const db = getDb();
    const goalService = new GoalService();
    const userId = 'user_default';

    // Insert activity records
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      INSERT INTO activity_records (id, user_id, platform, activity_date, problems_solved, submissions)
      VALUES ('act1', ?, 'leetcode', ?, 15, 25)
    `).run(userId, today);

    // Create a goal for 30 problems solved
    const goal = goalService.createGoal(userId, {
      title: 'Solve 30 problems this week',
      goal_type: 'problems_solved',
      target: 30,
      start_date: today,
      end_date: today
    });

    expect(goal.target).toBe(30);
    expect(goal.current).toBe(15);
    expect(goal.progress_percentage).toBe(50); // 15 / 30 = 50%
    expect(goal.status).toBe('active');

    // Add another 15 solved
    db.prepare(`
      UPDATE activity_records SET problems_solved = 30 WHERE id = 'act1'
    `).run();

    const updatedGoals = goalService.getGoals(userId);
    const updatedGoal = updatedGoals.find(g => g.id === goal.id);
    expect(updatedGoal?.current).toBe(30);
    expect(updatedGoal?.progress_percentage).toBe(100);
    expect(updatedGoal?.status).toBe('completed');
  });

  it('Difficulty Aggregation: accurately aggregates counts and percentages across platforms', () => {
    const db = getDb();
    const analytics = new AnalyticsService();
    const userId = 'user_default';
    const now = new Date().toISOString();

    // Connect two accounts
    db.prepare(`
      INSERT INTO platform_accounts (id, user_id, platform, username, profile_url, connection_status, created_at, updated_at)
      VALUES ('acc_lc', ?, 'leetcode', 'user1', 'http://lc', 'connected', ?, ?)
    `).run(userId, now, now);

    db.prepare(`
      INSERT INTO platform_accounts (id, user_id, platform, username, profile_url, connection_status, created_at, updated_at)
      VALUES ('acc_cf', ?, 'codeforces', 'user2', 'http://cf', 'connected', ?, ?)
    `).run(userId, now, now);

    // Snapshots: LC (10 easy, 20 med, 10 hard = 40)
    db.prepare(`
      INSERT INTO stat_snapshots (id, platform_account_id, user_id, platform, total_solved, easy_solved, medium_solved, hard_solved, recorded_at)
      VALUES ('snap_lc', 'acc_lc', ?, 'leetcode', 40, 10, 20, 10, ?)
    `).run(userId, now);

    // Snapshots: CF (30 easy, 20 med, 10 hard = 60)
    db.prepare(`
      INSERT INTO stat_snapshots (id, platform_account_id, user_id, platform, total_solved, easy_solved, medium_solved, hard_solved, recorded_at)
      VALUES ('snap_cf', 'acc_cf', ?, 'codeforces', 60, 30, 20, 10, ?)
    `).run(userId, now);

    const diff = analytics.getDifficultyDistribution(userId);
    // Total = 40 + 60 = 100
    // Easy = 10 + 30 = 40 (40%)
    // Medium = 20 + 20 = 40 (40%)
    // Hard = 10 + 10 = 20 (20%)
    expect(diff.total).toBe(100);
    expect(diff.easy.count).toBe(40);
    expect(diff.easy.percentage).toBe(40);
    expect(diff.medium.count).toBe(40);
    expect(diff.medium.percentage).toBe(40);
    expect(diff.hard.count).toBe(20);
    expect(diff.hard.percentage).toBe(20);
  });

  it('No Connected Platforms: returns empty states with has_data: false and no fake numbers', () => {
    const analytics = new AnalyticsService();
    const overview = analytics.getDashboardOverview('user_default');

    expect(overview.has_data).toBe(false);
    expect(overview.total_problems).toBeNull();
    expect(overview.current_streak).toBeNull();
    expect(overview.active_days).toBeNull();
    expect(overview.total_submissions).toBeNull();

    const history = analytics.getProblemsSolvedHistory('user_default', '30d');
    expect(history).toEqual([]);

    const diff = analytics.getDifficultyDistribution('user_default');
    expect(diff.total).toBe(0);
    expect(diff.easy.count).toBe(0);
    expect(diff.easy.percentage).toBe(0);
  });
});
