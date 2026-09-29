import { D1Database } from '@cloudflare/workers-types';
import { PlatformType, StatSnapshot } from '../types';

export class AnalyticsService {
  constructor(private db: D1Database) {}

  private parsePeriodToDays(period: string): number {
    switch (period) {
      case '7d': return 7;
      case '30d': return 30;
      case '3m': return 90;
      case '6m': return 180;
      case '1y': return 365;
      case 'all': default: return 0;
    }
  }

  private calculateStreaks(sortedDateStrings: string[]): { current_streak: number; longest_streak: number } {
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

  async getDashboardOverview(userId: string) {
    const { results: accounts } = await this.db.prepare(
      `SELECT id, platform FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'`
    ).bind(userId).all<{ id: string; platform: PlatformType }>();

    if (accounts.length === 0) {
      return {
        has_data: false,
        total_problems: 0,
        active_days: 0,
        current_streak: 0,
        longest_streak: 0,
        total_submissions: 0,
        last_synced_at: null
      };
    }

    let totalSolved = 0;
    let totalSubmissions = 0;
    let latestRecordedAt: string | null = null;
    let maxSnapshotLongestStreak = 0;
    let maxSnapshotCurrentStreak = 0;
    let maxSnapshotActiveDays = 0;

    for (const acc of accounts) {
      const snap = await this.db.prepare(
        'SELECT * FROM stat_snapshots WHERE platform_account_id = ? OR (user_id = ? AND platform = ?) ORDER BY recorded_at DESC LIMIT 1'
      ).bind(acc.id, userId, acc.platform).first<StatSnapshot>();

      if (snap) {
        totalSolved += snap.total_solved || 0;
        totalSubmissions += snap.total_submissions || 0;
        maxSnapshotCurrentStreak = Math.max(maxSnapshotCurrentStreak, snap.current_streak || 0);
        maxSnapshotLongestStreak = Math.max(maxSnapshotLongestStreak, snap.longest_streak || 0);
        maxSnapshotActiveDays = Math.max(maxSnapshotActiveDays, snap.active_days || 0);
        
        if (!latestRecordedAt || (snap.recorded_at && new Date(snap.recorded_at) > new Date(latestRecordedAt))) {
          latestRecordedAt = snap.recorded_at;
        }
      }
    }

    const { results: dates } = await this.db.prepare(
      `SELECT DISTINCT ar.activity_date FROM activity_records ar 
       JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected' 
       WHERE ar.user_id = ? AND (ar.problems_solved > 0 OR ar.submissions > 0) 
       ORDER BY ar.activity_date ASC`
    ).bind(userId).all<{ activity_date: string }>();

    const activeDatesList = dates.map(d => d.activity_date);
    const { current_streak, longest_streak } = this.calculateStreaks(activeDatesList);

    return {
      has_data: true,
      total_problems: totalSolved,
      active_days: Math.max(activeDatesList.length, maxSnapshotActiveDays),
      current_streak: activeDatesList.length > 0 ? current_streak : maxSnapshotCurrentStreak,
      longest_streak: Math.max(longest_streak, maxSnapshotLongestStreak),
      total_submissions: totalSubmissions,
      last_synced_at: latestRecordedAt
    };
  }

  async getProblemsSolvedHistory(userId: string, period: string) {
    const days = this.parsePeriodToDays(period);
    
    const { results: accounts } = await this.db.prepare(
      `SELECT id, platform FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'`
    ).bind(userId).all<{ id: string; platform: PlatformType }>();

    let totalSolvedAllTime = 0;
    for (const acc of accounts) {
      const snap = await this.db.prepare(
        'SELECT total_solved FROM stat_snapshots WHERE platform_account_id = ? ORDER BY recorded_at DESC LIMIT 1'
      ).bind(acc.id).first<{ total_solved: number }>();
      if (snap) totalSolvedAllTime += snap.total_solved || 0;
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const windowDays = days > 0 ? days : 365;
    const startDate = new Date(now.getTime() - windowDays * 86400000);
    const startDateStr = startDate.toISOString().split('T')[0];

    const { results: rows } = await this.db.prepare(`
      SELECT ar.activity_date, SUM(ar.problems_solved) as daily_solved
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= ? AND ar.activity_date <= ?
      GROUP BY ar.activity_date
      ORDER BY ar.activity_date ASC
    `).bind(userId, startDateStr, todayStr).all<{ activity_date: string; daily_solved: number }>();

    const activityMap: Record<string, number> = {};
    let periodSolved = 0;
    for (const r of rows) {
      activityMap[r.activity_date] = r.daily_solved || 0;
      periodSolved += (r.daily_solved || 0);
    }

    const timeline: string[] = [];
    const cur = new Date(startDateStr + 'T00:00:00Z');
    const end = new Date(todayStr + 'T00:00:00Z');

    while (cur <= end) {
      timeline.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    const baselineSolved = Math.max(0, totalSolvedAllTime - periodSolved);
    let runningCumulative = baselineSolved;

    const result = timeline.map(date => {
      const daily = activityMap[date] || 0;
      runningCumulative += daily;
      return {
        date,
        daily,
        cumulative: runningCumulative
      };
    });

    return result;
  }

  async getCodingActivity(userId: string, platformFilter?: string) {
    let query = `
      SELECT activity_date as date, 
             SUM(problems_solved) as problems_solved, 
             SUM(submissions) as submissions,
             GROUP_CONCAT(DISTINCT ar.platform) as platforms
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND activity_date >= date('now', '-365 days')
    `;
    const params: any[] = [userId];

    if (platformFilter && platformFilter.toLowerCase() !== 'all') {
      query += ` AND ar.platform = ?`;
      params.push(platformFilter.toLowerCase());
    }

    query += ` GROUP BY activity_date ORDER BY activity_date ASC`;

    const { results: activities } = await this.db.prepare(query).bind(...params).all<{ 
      date: string; 
      problems_solved: number; 
      submissions: number; 
      platforms: string | null; 
    }>();

    return activities.map(a => {
      const pSolved = a.problems_solved || 0;
      const subs = a.submissions || 0;
      const count = pSolved > 0 ? pSolved : (subs > 0 ? subs : 1);
      let level = 0;
      if (count >= 10) level = 4;
      else if (count >= 6) level = 3;
      else if (count >= 3) level = 2;
      else if (count >= 1) level = 1;

      return {
        date: a.date,
        count,
        problems_solved: pSolved,
        submissions: subs,
        platforms: a.platforms ? a.platforms.split(',') : [],
        level
      };
    });
  }

  async getDifficultyDistribution(userId: string) {
    const { results: accounts } = await this.db.prepare(
      `SELECT id, platform FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'`
    ).bind(userId).all<{ id: string; platform: PlatformType }>();

    if (accounts.length === 0) {
      return {
        easy: { count: 0, percentage: 0 },
        medium: { count: 0, percentage: 0 },
        hard: { count: 0, percentage: 0 },
        total: 0
      };
    }

    let easy = 0, medium = 0, hard = 0;

    for (const acc of accounts) {
      const snap = await this.db.prepare(
        'SELECT easy_solved, medium_solved, hard_solved FROM stat_snapshots WHERE platform_account_id = ? ORDER BY recorded_at DESC LIMIT 1'
      ).bind(acc.id).first<{ easy_solved: number; medium_solved: number; hard_solved: number }>();
      
      if (snap) {
        easy += snap.easy_solved || 0;
        medium += snap.medium_solved || 0;
        hard += snap.hard_solved || 0;
      }
    }

    const total = easy + medium + hard;
    const calcPct = (cnt: number) => (total > 0 ? Math.round((cnt / total) * 100) : 0);

    return {
      easy: { count: easy, percentage: calcPct(easy) },
      medium: { count: medium, percentage: calcPct(medium) },
      hard: { count: hard, percentage: calcPct(hard) },
      total
    };
  }

  async getTopicDistribution(userId: string) {
    const standardTopics = [
      'Arrays',
      'Strings',
      'Sorting',
      'Binary Search',
      'Hashing',
      'Two Pointers',
      'Sliding Window',
      'Linked Lists',
      'Stack',
      'Queue',
      'Trees',
      'Graphs',
      'Dynamic Programming',
      'Greedy',
      'Math',
      'Bit Manipulation'
    ];

    const aliasMap: Record<string, string> = {
      'dfs': 'Graphs', 'bfs': 'Graphs', 'graph': 'Graphs', 'graphs': 'Graphs', 'tree': 'Trees', 'trees': 'Trees', 'binary tree': 'Trees',
      'dp': 'Dynamic Programming', 'dynamic-programming': 'Dynamic Programming', 'dynamic programming': 'Dynamic Programming',
      'math': 'Math', 'mathematics': 'Math', 'number-theory': 'Math',
      'string': 'Strings', 'strings': 'Strings',
      'array': 'Arrays', 'arrays': 'Arrays', 'data structures': 'Arrays',
      'hash-table': 'Hashing', 'hashing': 'Hashing', 'hash table': 'Hashing', 'map': 'Hashing',
      'sorting': 'Sorting', 'sort': 'Sorting', 'sortings': 'Sorting',
      'greedy': 'Greedy',
      'binary-search': 'Binary Search', 'binary search': 'Binary Search', 'searching': 'Binary Search',
      'two-pointers': 'Two Pointers', 'two pointers': 'Two Pointers',
      'sliding-window': 'Sliding Window', 'sliding window': 'Sliding Window',
      'bit-manipulation': 'Bit Manipulation', 'bit manipulation': 'Bit Manipulation', 'bitmasks': 'Bit Manipulation',
      'stack': 'Stack', 'queue': 'Queue', 'stack/queue': 'Stack',
      'linked-list': 'Linked Lists', 'linked list': 'Linked Lists', 'linked lists': 'Linked Lists'
    };

    const topicCounts: Record<string, number> = {};

    const { results: dbTopics } = await this.db.prepare(`
      SELECT pt.topic, pt.problem_count
      FROM platform_topics pt
      JOIN platform_accounts pa ON pt.user_id = pa.user_id AND pt.platform = pa.platform AND pa.connection_status = 'connected'
      WHERE pt.user_id = ?
    `).bind(userId).all<{ topic: string; problem_count: number }>();

    for (const t of dbTopics) {
      const lowerTopic = t.topic.toLowerCase();
      const standardTopic = aliasMap[lowerTopic] || t.topic;
      topicCounts[standardTopic] = (topicCounts[standardTopic] || 0) + t.problem_count;
    }

    const { results: problemTopics } = await this.db.prepare(`
      SELECT p.topic, COUNT(up.id) as count
      FROM user_problems up
      JOIN problems p ON up.problem_id = p.id
      JOIN platform_accounts pa ON pa.user_id = up.user_id AND pa.platform = p.platform AND pa.connection_status = 'connected'
      WHERE up.user_id = ? AND p.topic IS NOT NULL AND p.topic != ''
      GROUP BY p.topic
    `).bind(userId).all<{ topic: string; count: number }>();

    for (const t of problemTopics) {
      if (!t.topic) continue;
      const lowerTopic = t.topic.toLowerCase();
      const standardTopic = aliasMap[lowerTopic] || t.topic;
      topicCounts[standardTopic] = (topicCounts[standardTopic] || 0) + t.count;
    }

    let totalTopicSolved = 0;
    for (const name of standardTopics) {
      totalTopicSolved += (topicCounts[name] || 0);
    }

    return standardTopics.map(name => {
      const count = topicCounts[name] || 0;
      const percentage = totalTopicSolved > 0 ? Math.round((count / totalTopicSolved) * 100) : 0;
      return { name, count, percentage };
    });
  }

  async getRecentActivity(userId: string, limit: number) {
    const { results: problems } = await this.db.prepare(`
      SELECT p.platform, p.title, p.difficulty, up.solved_at as date, p.url
      FROM user_problems up
      JOIN problems p ON up.problem_id = p.id
      JOIN platform_accounts pa ON pa.user_id = up.user_id AND pa.platform = p.platform AND pa.connection_status = 'connected'
      WHERE up.user_id = ?
      ORDER BY up.solved_at DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return problems;
  }

  async getContests(userId: string, limit: number = 50) {
    const { results: contests } = await this.db.prepare(`
      SELECT c.platform, c.name, c.contest_date, c.url,
             cr.rank, cr.problems_solved, cr.rating_before, cr.rating_after, cr.rating_change
      FROM contest_results cr
      JOIN contests c ON cr.contest_id = c.id
      JOIN platform_accounts pa ON pa.user_id = cr.user_id AND pa.platform = c.platform AND pa.connection_status = 'connected'
      WHERE cr.user_id = ?
      ORDER BY c.contest_date DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return contests;
  }

  async getSmartInsights(userId: string): Promise<string[]> {
    const insights: string[] = [];

    const { results: thisWeek } = await this.db.prepare(`
      SELECT SUM(problems_solved) as solved
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= date('now', '-7 days')
    `).bind(userId).all<{ solved: number }>();

    const { results: lastWeek } = await this.db.prepare(`
      SELECT SUM(problems_solved) as solved
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= date('now', '-14 days') AND ar.activity_date < date('now', '-7 days')
    `).bind(userId).all<{ solved: number }>();

    const thisWeekSolved = thisWeek[0]?.solved || 0;
    const lastWeekSolved = lastWeek[0]?.solved || 0;

    if (thisWeekSolved > lastWeekSolved && lastWeekSolved > 0) {
      insights.push(`You solved ${thisWeekSolved - lastWeekSolved} more problems this week (${thisWeekSolved}) than last week (${lastWeekSolved}).`);
    } else if (thisWeekSolved > 0) {
      insights.push(`You solved ${thisWeekSolved} problems in the last 7 days.`);
    }

    const { results: platformActivity } = await this.db.prepare(`
      SELECT ar.platform, SUM(problems_solved) as solved, SUM(submissions) as subs
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= date('now', '-30 days')
      GROUP BY ar.platform
      ORDER BY solved DESC, subs DESC
      LIMIT 1
    `).bind(userId).all<{ platform: string; solved: number; subs: number }>();

    if (platformActivity[0] && (platformActivity[0].solved > 0 || platformActivity[0].subs > 0)) {
      const topP = platformActivity[0].platform;
      const platformName = topP === 'leetcode' ? 'LeetCode'
        : topP === 'codechef' ? 'CodeChef'
        : topP === 'geeksforgeeks' ? 'GeeksforGeeks'
        : 'Codeforces';
      insights.push(`Your most active platform this month was ${platformName} with ${platformActivity[0].solved} problems solved.`);
    }

    const { results: activeDaysWeek } = await this.db.prepare(`
      SELECT COUNT(DISTINCT ar.activity_date) as cnt
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= date('now', '-7 days') AND (ar.problems_solved > 0 OR ar.submissions > 0)
    `).bind(userId).all<{ cnt: number }>();

    if (activeDaysWeek[0]?.cnt && activeDaysWeek[0].cnt > 0) {
      insights.push(`You were active on ${activeDaysWeek[0].cnt} of the last 7 tracked days.`);
    }

    return insights;
  }
}
