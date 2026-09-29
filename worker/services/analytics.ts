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

  private calculateStreaks(dates: string[]): { current_streak: number; longest_streak: number } {
    if (!dates || dates.length === 0) return { current_streak: 0, longest_streak: 0 };
    
    const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let current_streak = 0;
    let longest_streak = 0;
    let currentCount = 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let lastDate = new Date(sortedDates[0]);
    lastDate.setHours(0,0,0,0);

    let isCurrentActive = false;
    
    if (lastDate.getTime() === today.getTime() || lastDate.getTime() === yesterday.getTime()) {
      isCurrentActive = true;
      currentCount = 1;
    } else {
      currentCount = 1;
    }
    
    longest_streak = 1;
    
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = lastDate;
      const currDate = new Date(sortedDates[i]);
      currDate.setHours(0,0,0,0);
      
      const diffTime = Math.abs(prevDate.getTime() - currDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentCount++;
      } else if (diffDays > 1) {
        if (isCurrentActive) {
          current_streak = currentCount;
          isCurrentActive = false;
        }
        currentCount = 1;
      }
      
      if (currentCount > longest_streak) {
        longest_streak = currentCount;
      }
      
      lastDate = currDate;
    }
    
    if (isCurrentActive) {
      current_streak = currentCount;
    }
    
    return { current_streak, longest_streak };
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
      current_streak: Math.max(current_streak, maxSnapshotCurrentStreak),
      longest_streak: Math.max(longest_streak, maxSnapshotLongestStreak),
      total_submissions,
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

    let dateCondition = '';
    const params: any[] = [userId];
    if (days > 0) {
      dateCondition = `AND activity_date >= date('now', '-' || ? || ' days')`;
      params.push(days);
    }

    const { results: history } = await this.db.prepare(`
      SELECT activity_date as date, SUM(problems_solved) as problems_solved
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? ${dateCondition}
      GROUP BY activity_date
      ORDER BY activity_date ASC
    `).bind(...params).all<{ date: string; problems_solved: number }>();

    let periodSolvedCount = 0;
    for (const h of history) {
      periodSolvedCount += h.problems_solved;
    }

    let currentCumulative = totalSolvedAllTime - periodSolvedCount;

    const timeline = history.map(h => {
      currentCumulative += h.problems_solved;
      return {
        date: h.date,
        daily_solved: h.problems_solved,
        cumulative_solved: currentCumulative
      };
    });

    return timeline;
  }

  async getCodingActivity(userId: string, platformFilter?: string) {
    let query = `
      SELECT activity_date as date, SUM(problems_solved) as count
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND activity_date >= date('now', '-365 days')
    `;
    const params: any[] = [userId];

    if (platformFilter) {
      query += ` AND ar.platform = ?`;
      params.push(platformFilter);
    }

    query += ` GROUP BY activity_date ORDER BY activity_date ASC`;

    const { results: activities } = await this.db.prepare(query).bind(...params).all<{ date: string; count: number }>();

    return activities.map(a => {
      let level = 0;
      if (a.count > 0) level = 1;
      if (a.count > 2) level = 2;
      if (a.count > 5) level = 3;
      if (a.count > 10) level = 4;
      return { date: a.date, count: a.count, level };
    });
  }

  async getDifficultyDistribution(userId: string) {
    const { results: accounts } = await this.db.prepare(
      `SELECT id, platform FROM platform_accounts WHERE user_id = ? AND connection_status = 'connected'`
    ).bind(userId).all<{ id: string; platform: PlatformType }>();

    let easy = 0, medium = 0, hard = 0, unknown = 0;

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

    const { results: unknownProbs } = await this.db.prepare(`
      SELECT count(*) as count 
      FROM problems p
      JOIN platform_accounts pa ON p.user_id = pa.user_id AND p.platform = pa.platform AND pa.connection_status = 'connected'
      WHERE p.user_id = ? AND (p.difficulty IS NULL OR p.difficulty = 'Other')
    `).bind(userId).all<{ count: number }>();

    unknown += (unknownProbs[0]?.count || 0);

    return { easy, medium, hard, unknown };
  }

  async getTopicDistribution(userId: string) {
    const aliasMap: Record<string, string> = {
      'dfs': 'Graph/Tree', 'bfs': 'Graph/Tree', 'graph': 'Graph/Tree', 'tree': 'Graph/Tree',
      'dp': 'Dynamic Programming', 'dynamic-programming': 'Dynamic Programming',
      'math': 'Math', 'mathematics': 'Math', 'number-theory': 'Math',
      'string': 'Strings', 'strings': 'Strings',
      'array': 'Arrays', 'arrays': 'Arrays',
      'hash-table': 'Hashing', 'hashing': 'Hashing', 'map': 'Hashing',
      'sorting': 'Sorting', 'sort': 'Sorting',
      'greedy': 'Greedy',
      'binary-search': 'Binary Search',
      'two-pointers': 'Two Pointers',
      'bit-manipulation': 'Bit Manipulation',
      'stack': 'Stack/Queue', 'queue': 'Stack/Queue',
      'linked-list': 'Linked List'
    };

    const topicsMap = new Map<string, number>();

    const { results: dbTopics } = await this.db.prepare(`
      SELECT pt.topic_name, pt.problems_count
      FROM platform_topics pt
      JOIN platform_accounts pa ON pt.user_id = pa.user_id AND pt.platform = pa.platform AND pa.connection_status = 'connected'
      WHERE pt.user_id = ?
    `).bind(userId).all<{ topic_name: string; problems_count: number }>();

    for (const t of dbTopics) {
      const lowerTopic = t.topic_name.toLowerCase();
      const standardTopic = aliasMap[lowerTopic] || t.topic_name;
      topicsMap.set(standardTopic, (topicsMap.get(standardTopic) || 0) + t.problems_count);
    }

    const { results: problemTopics } = await this.db.prepare(`
      SELECT p.topic, COUNT(*) as count
      FROM problems p
      JOIN platform_accounts pa ON p.user_id = pa.user_id AND p.platform = pa.platform AND pa.connection_status = 'connected'
      WHERE p.user_id = ? AND p.topic IS NOT NULL
      GROUP BY p.topic
    `).bind(userId).all<{ topic: string; count: number }>();

    for (const t of problemTopics) {
      if (!t.topic) continue;
      const lowerTopic = t.topic.toLowerCase();
      const standardTopic = aliasMap[lowerTopic] || t.topic;
      topicsMap.set(standardTopic, (topicsMap.get(standardTopic) || 0) + t.count);
    }

    const topicsArray = Array.from(topicsMap.entries()).map(([topic, count]) => ({ topic, count }));
    topicsArray.sort((a, b) => b.count - a.count);

    return topicsArray.slice(0, 16);
  }

  async getRecentActivity(userId: string, limit: number) {
    const { results: problems } = await this.db.prepare(`
      SELECT p.id, p.platform, p.external_id, p.title, p.slug, p.url, p.difficulty, p.topic, p.solved_at
      FROM problems p
      JOIN platform_accounts pa ON p.user_id = pa.user_id AND p.platform = pa.platform AND pa.connection_status = 'connected'
      WHERE p.user_id = ?
      ORDER BY p.solved_at DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return problems;
  }

  async getContests(userId: string, limit: number) {
    const { results: contests } = await this.db.prepare(`
      SELECT c.id, c.platform, c.external_contest_id, c.name, c.contest_date, c.url, c.rank, c.problems_solved, c.rating_before, c.rating_after, c.rating_change
      FROM contests c
      JOIN platform_accounts pa ON c.user_id = pa.user_id AND c.platform = pa.platform AND pa.connection_status = 'connected'
      WHERE c.user_id = ?
      ORDER BY c.contest_date DESC
      LIMIT ?
    `).bind(userId, limit).all();

    return contests;
  }

  async getSmartInsights(userId: string) {
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

    let weekOverWeek = 'Stable';
    if (thisWeekSolved > lastWeekSolved) weekOverWeek = 'Improving';
    else if (thisWeekSolved < lastWeekSolved) weekOverWeek = 'Declining';

    const { results: platformActivity } = await this.db.prepare(`
      SELECT ar.platform, SUM(problems_solved) as solved
      FROM activity_records ar
      JOIN platform_accounts pa ON pa.user_id = ar.user_id AND pa.platform = ar.platform AND pa.connection_status = 'connected'
      WHERE ar.user_id = ? AND ar.activity_date >= date('now', '-30 days')
      GROUP BY ar.platform
      ORDER BY solved DESC
      LIMIT 1
    `).bind(userId).all<{ platform: string; solved: number }>();

    const mostActivePlatform = platformActivity[0]?.platform || 'None';

    return {
      week_over_week: weekOverWeek,
      this_week_solved: thisWeekSolved,
      last_week_solved: lastWeekSolved,
      most_active_platform: mostActivePlatform
    };
  }
}
