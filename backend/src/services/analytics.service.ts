import { getDb } from '../db/database.js';
import { PlatformType, StatSnapshot } from '../types/index.js';

export class AnalyticsService {
  /**
   * Top-level summary statistics for Dashboard
   */
  getDashboardOverview(userId: string) {
    const db = getDb();

    // Check connected accounts
    const accounts = db.prepare(`
      SELECT id, platform FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'
    `).all(userId) as { id: string; platform: PlatformType }[];

    if (accounts.length === 0) {
      return {
        has_data: false,
        total_problems: null,
        active_days: null,
        current_streak: null,
        longest_streak: null,
        total_submissions: null,
        last_synced_at: null
      };
    }

    // Get latest snapshot per platform account
    let totalSolved = 0;
    let totalSubmissions = 0;
    let latestRecordedAt: string | null = null;

    for (const acc of accounts) {
      const snap = db.prepare(`
        SELECT * FROM stat_snapshots
        WHERE platform_account_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
      `).get(acc.id) as StatSnapshot | undefined;

      if (snap) {
        totalSolved += snap.total_solved || 0;
        totalSubmissions += snap.total_submissions || 0;
        if (!latestRecordedAt || snap.recorded_at > latestRecordedAt) {
          latestRecordedAt = snap.recorded_at;
        }
      }
    }

    // Calculate active days and streaks from activity_records of connected platforms
    const dates = db.prepare(`
      SELECT DISTINCT ar.activity_date FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND (ar.problems_solved > 0 OR ar.submissions > 0)
      ORDER BY ar.activity_date ASC
    `).all(userId) as { activity_date: string }[];

    const activeDatesList = dates.map(d => d.activity_date);
    const { currentStreak, longestStreak } = this.calculateStreaks(activeDatesList);

    return {
      has_data: true,
      total_problems: totalSolved,
      active_days: activeDatesList.length,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_submissions: totalSubmissions,
      last_synced_at: latestRecordedAt
    };
  }

  /**
   * Problems Solved over time (with time filters: 7d, 30d, 3m, 6m, 1y, all)
   */
  getProblemsSolvedHistory(userId: string, period: string = '30d') {
    const db = getDb();
    const daysLimit = this.parsePeriodToDays(period);

    let dateFilterClause = '';
    const params: any[] = [userId];

    if (daysLimit !== null) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysLimit);
      dateFilterClause = 'AND ar.activity_date >= ?';
      params.push(startDate.toISOString().split('T')[0]);
    }

    // Aggregate daily solved problems across all connected platforms
    const rows = db.prepare(`
      SELECT ar.activity_date, SUM(ar.problems_solved) as daily_solved
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? ${dateFilterClause}
      GROUP BY ar.activity_date
      ORDER BY ar.activity_date ASC
    `).all(...params) as { activity_date: string; daily_solved: number }[];

    if (rows.length === 0) {
      return [];
    }

    // Compute running cumulative count or daily points
    let cumulative = 0;
    return rows.map(r => {
      cumulative += r.daily_solved;
      return {
        date: r.activity_date,
        daily: r.daily_solved,
        cumulative
      };
    });
  }

  /**
   * Coding activity calendar / heatmap data (past 365 days)
   */
  getCodingActivity(userId: string, platformFilter?: string) {
    const db = getDb();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

    let query = `
      SELECT ar.activity_date, ar.platform, ar.problems_solved, ar.submissions
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= ?
    `;
    const params: any[] = [userId, oneYearAgoStr];

    if (platformFilter && platformFilter.toLowerCase() !== 'all') {
      query += ' AND ar.platform = ?';
      params.push(platformFilter.toLowerCase());
    }

    query += ' ORDER BY ar.activity_date ASC';

    const rows = db.prepare(query).all(...params) as {
      activity_date: string;
      platform: string;
      problems_solved: number;
      submissions: number;
    }[];

    // Group by activity_date
    const dateMap: Record<string, { count: number; problems: number; submissions: number; platforms: string[] }> = {};
    for (const r of rows) {
      if (!dateMap[r.activity_date]) {
        dateMap[r.activity_date] = { count: 0, problems: 0, submissions: 0, platforms: [] };
      }
      dateMap[r.activity_date].problems += r.problems_solved;
      dateMap[r.activity_date].submissions += r.submissions;
      dateMap[r.activity_date].count += (r.problems_solved || r.submissions || 1);
      if (!dateMap[r.activity_date].platforms.includes(r.platform)) {
        dateMap[r.activity_date].platforms.push(r.platform);
      }
    }

    return Object.entries(dateMap).map(([date, data]) => {
      let level = 0;
      if (data.count >= 10) level = 4;
      else if (data.count >= 6) level = 3;
      else if (data.count >= 3) level = 2;
      else if (data.count >= 1) level = 1;

      return {
        date,
        count: data.count,
        problems_solved: data.problems,
        submissions: data.submissions,
        platforms: data.platforms,
        level
      };
    });
  }

  /**
   * Difficulty Breakdown (Easy, Medium, Hard)
   */
  getDifficultyDistribution(userId: string) {
    const db = getDb();
    const accounts = db.prepare(`
      SELECT id FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'
    `).all(userId) as { id: string }[];

    if (accounts.length === 0) {
      return {
        easy: { count: 0, percentage: 0 },
        medium: { count: 0, percentage: 0 },
        hard: { count: 0, percentage: 0 },
        total: 0
      };
    }

    let totalEasy = 0;
    let totalMedium = 0;
    let totalHard = 0;

    for (const acc of accounts) {
      const snap = db.prepare(`
        SELECT easy_solved, medium_solved, hard_solved FROM stat_snapshots
        WHERE platform_account_id = ?
        ORDER BY recorded_at DESC
        LIMIT 1
      `).get(acc.id) as { easy_solved: number; medium_solved: number; hard_solved: number } | undefined;

      if (snap) {
        totalEasy += snap.easy_solved || 0;
        totalMedium += snap.medium_solved || 0;
        totalHard += snap.hard_solved || 0;
      }
    }

    const total = totalEasy + totalMedium + totalHard;
    const calcPct = (cnt: number) => (total > 0 ? Math.round((cnt / total) * 100) : 0);

    return {
      easy: { count: totalEasy, percentage: calcPct(totalEasy) },
      medium: { count: totalMedium, percentage: calcPct(totalMedium) },
      hard: { count: totalHard, percentage: calcPct(totalHard) },
      total
    };
  }

  /**
   * DSA / Topic Distribution
   */
  getTopicDistribution(userId: string) {
    const db = getDb();

    // Standard DSA topics
    const standardTopics = [
      'Arrays',
      'Strings',
      'Hashing',
      'Two Pointers',
      'Sliding Window',
      'Binary Search',
      'Trees',
      'Graphs',
      'Dynamic Programming',
      'Greedy',
      'Stack',
      'Queue',
      'Bit Manipulation',
      'Math'
    ];

    const rows = db.prepare(`
      SELECT p.topic, COUNT(up.id) as count
      FROM user_problems up
      JOIN problems p ON up.problem_id = p.id
      JOIN platform_accounts pa ON pa.user_id = up.user_id AND pa.platform = p.platform AND pa.connection_status = 'connected'
      WHERE up.user_id = ? AND p.topic IS NOT NULL AND p.topic != ''
      GROUP BY p.topic
      ORDER BY count DESC
    `).all(userId) as { topic: string; count: number }[];

    const topicMap = new Map<string, number>();
    for (const r of rows) {
      topicMap.set(r.topic, r.count);
    }

    // Calculate total count
    let totalSolvedWithTopic = 0;
    for (const count of topicMap.values()) {
      totalSolvedWithTopic += count;
    }

    return standardTopics.map(name => {
      const count = topicMap.get(name) || 0;
      const percentage = totalSolvedWithTopic > 0 ? Math.round((count / totalSolvedWithTopic) * 100) : 0;
      return {
        name,
        count,
        percentage
      };
    });
  }

  /**
   * Recent solved problems
   */
  getRecentActivity(userId: string, limit: number = 20) {
    const db = getDb();
    return db.prepare(`
      SELECT p.platform, p.title, p.difficulty, up.solved_at as date, p.url
      FROM user_problems up
      JOIN problems p ON up.problem_id = p.id
      JOIN platform_accounts pa ON pa.user_id = up.user_id AND pa.platform = p.platform AND pa.connection_status = 'connected'
      WHERE up.user_id = ?
      ORDER BY up.solved_at DESC
      LIMIT ?
    `).all(userId, limit) as {
      platform: string;
      title: string;
      difficulty: string;
      date: string;
      url?: string;
    }[];
  }

  /**
   * Contest analytics - strictly for connected platforms
   */
  getContests(userId: string, limit: number = 50) {
    const db = getDb();
    return db.prepare(`
      SELECT c.platform, c.name, c.contest_date, c.url,
             cr.rank, cr.problems_solved, cr.rating_before, cr.rating_after, cr.rating_change
      FROM contest_results cr
      JOIN contests c ON cr.contest_id = c.id
      JOIN platform_accounts pa ON pa.user_id = cr.user_id AND pa.platform = c.platform AND pa.connection_status = 'connected'
      WHERE cr.user_id = ?
      ORDER BY c.contest_date DESC
      LIMIT ?
    `).all(userId, limit);
  }

  /**
   * Purely factual smart insights derived mathematically from data
   */
  getSmartInsights(userId: string) {
    const db = getDb();
    const insights: string[] = [];

    // 1. Check week over week solved comparison
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000).toISOString().split('T')[0];

    const thisWeek = db.prepare(`
      SELECT SUM(ar.problems_solved) as total FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= ?
    `).get(userId, weekAgo) as { total: number | null };

    const lastWeek = db.prepare(`
      SELECT SUM(ar.problems_solved) as total FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= ? AND ar.activity_date < ?
    `).get(userId, twoWeeksAgo, weekAgo) as { total: number | null };

    const thisWeekSolved = thisWeek?.total || 0;
    const lastWeekSolved = lastWeek?.total || 0;

    if (thisWeekSolved > lastWeekSolved && lastWeekSolved > 0) {
      insights.push(`You solved ${thisWeekSolved - lastWeekSolved} more problems this week (${thisWeekSolved}) than last week (${lastWeekSolved}).`);
    } else if (thisWeekSolved > 0) {
      insights.push(`You solved ${thisWeekSolved} problems in the last 7 days.`);
    }

    // 2. Most active platform in past 30 days
    const monthAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
    const topPlatform = db.prepare(`
      SELECT ar.platform, SUM(ar.problems_solved) as solved, SUM(ar.submissions) as subs
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= ?
      GROUP BY ar.platform
      ORDER BY solved DESC, subs DESC
      LIMIT 1
    `).get(userId, monthAgo) as { platform: string; solved: number; subs: number } | undefined;

    if (topPlatform && (topPlatform.solved > 0 || topPlatform.subs > 0)) {
      const platformName = topPlatform.platform === 'leetcode' ? 'LeetCode'
        : topPlatform.platform === 'codechef' ? 'CodeChef'
        : topPlatform.platform === 'geeksforgeeks' ? 'GeeksforGeeks'
        : 'Codeforces';
      insights.push(`Your most active platform this month was ${platformName} with ${topPlatform.solved} problems solved.`);
    }

    // 3. Active days in past week
    const activeDaysWeek = db.prepare(`
      SELECT COUNT(DISTINCT ar.activity_date) as cnt FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= ? AND (ar.problems_solved > 0 OR ar.submissions > 0)
    `).get(userId, weekAgo) as { cnt: number };

    if (activeDaysWeek?.cnt > 0) {
      insights.push(`You were active on ${activeDaysWeek.cnt} of the last 7 tracked days.`);
    }

    return insights;
  }

  private parsePeriodToDays(period: string): number | null {
    switch (period.toLowerCase()) {
      case '7d': return 7;
      case '30d': return 30;
      case '3m': return 90;
      case '6m': return 180;
      case '1y': return 365;
      case 'all': return null;
      default: return 30;
    }
  }

  private calculateStreaks(sortedDateStrings: string[]): { currentStreak: number; longestStreak: number } {
    if (sortedDateStrings.length === 0) return { currentStreak: 0, longestStreak: 0 };

    let longest = 0;
    let current = 0;
    let tempStreak = 0;
    let prevDate: Date | null = null;

    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    for (const dateStr of sortedDateStrings) {
      const curDate = new Date(dateStr + 'T00:00:00Z');
      if (prevDate) {
        const diffDays = Math.round((curDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
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

    const lastDate = sortedDateStrings[sortedDateStrings.length - 1];
    if (lastDate === todayStr || lastDate === yesterdayStr) {
      current = tempStreak;
    } else {
      current = 0;
    }

    return { currentStreak: current, longestStreak: longest };
  }
}
