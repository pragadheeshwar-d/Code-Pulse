import { BaseCollector } from './base.collector.js';
import { NormalizedProfileData } from '../types/index.js';

export class GeeksforGeeksCollector extends BaseCollector {
  readonly platform = 'geeksforgeeks' as const;

  async validateUsername(username: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`https://www.geeksforgeeks.org/profile/${encodeURIComponent(username)}`);
      if (!res.ok) return false;
      const text = await res.text();
      return text.includes('total_problems_solved') || text.includes('score') || (text.includes('Profile') && !text.includes('undefined   | GeeksforGeeks Profile'));
    } catch {
      return false;
    }
  }

  async fetchProfile(username: string): Promise<NormalizedProfileData> {
    const url = `https://www.geeksforgeeks.org/profile/${encodeURIComponent(username)}`;
    const res = await this.fetchWithTimeout(url);

    if (!res.ok) {
      throw new Error(`GeeksforGeeks profile request failed: HTTP ${res.status}`);
    }

    const html = await res.text();
    if (html.includes('undefined   | GeeksforGeeks Profile') && !html.includes('total_problems_solved')) {
      throw new Error(`GeeksforGeeks user '${username}' not found.`);
    }

    let totalSolved = 0;
    let score: number | null = null;
    let instituteRank: number | null = null;
    let currentStreak = 0;
    let longestStreak = 0;
    let totalSubmissions = 0;

    // Look for JSON payload in Next.js streaming scripts
    const solvedIdx = html.indexOf('total_problems_solved');
    if (solvedIdx !== -1) {
      try {
        const start = html.lastIndexOf('{', solvedIdx);
        // Find matching closing brace or extract substring
        const snippet = html.slice(start, start + 3000);
        // Unescape quotes and slashes if present
        const unescaped = snippet.replace(/\\"/g, '"').replace(/\\\\/g, '\\');

        const solvedMatch = unescaped.match(/"total_problems_solved":\s*(\d+)/);
        if (solvedMatch) totalSolved = parseInt(solvedMatch[1], 10);

        const scoreMatch = unescaped.match(/"score":\s*(\d+)/);
        if (scoreMatch) score = parseInt(scoreMatch[1], 10);

        const rankMatch = unescaped.match(/"institute_rank":\s*(\d+)/);
        if (rankMatch) instituteRank = parseInt(rankMatch[1], 10);

        const curStreakMatch = unescaped.match(/"pod_solved_current_streak":\s*(\d+)/);
        if (curStreakMatch) currentStreak = parseInt(curStreakMatch[1], 10);

        const longStreakMatch = unescaped.match(/"pod_solved_longest_streak":\s*(\d+)/);
        if (longStreakMatch) longestStreak = parseInt(longStreakMatch[1], 10);

        const subMatch = unescaped.match(/"pod_correct_submissions_count":\s*(\d+)/);
        if (subMatch) totalSubmissions = parseInt(subMatch[1], 10);
      } catch {
        // continue
      }
    } else {
      // Fallback regex in case HTML format differs
      const altSolved = html.match(/Problems Solved:\s*(\d+)/i) || html.match(/total_problems_solved&quot;:(\d+)/i);
      if (altSolved) totalSolved = parseInt(altSolved[1], 10);

      const altScore = html.match(/Coding Score:\s*(\d+)/i) || html.match(/score&quot;:(\d+)/i);
      if (altScore) score = parseInt(altScore[1], 10);
    }

    return {
      platform: 'geeksforgeeks',
      username,
      profile_url: url,
      total_solved: totalSolved,
      easy_solved: 0,
      medium_solved: 0,
      hard_solved: 0,
      rating: score, // GFG uses coding score as rating metric
      rank: instituteRank,
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_submissions: totalSubmissions,
      active_days: currentStreak > 0 ? currentStreak : 0,
      recent_problems: [],
      contests: [],
      activities: []
    };
  }
}
