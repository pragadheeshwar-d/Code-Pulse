import { BaseCollector } from './base.collector.js';
import { NormalizedProfileData, NormalizedProblem, NormalizedContest, NormalizedActivity } from '../types/index.js';

export class CodeChefCollector extends BaseCollector {
  readonly platform = 'codechef' as const;

  async validateUsername(username: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });
      if (!res.ok) return false;
      const html = await res.text();
      return html.includes('rating-header') || html.includes('user-details-container');
    } catch {
      return false;
    }
  }

  async fetchProfile(username: string): Promise<NormalizedProfileData> {
    const url = `https://www.codechef.com/users/${encodeURIComponent(username)}`;
    const res = await this.fetchWithTimeout(url);

    if (!res.ok) {
      throw new Error(`CodeChef request failed with status: ${res.status}`);
    }

    const html = await res.text();

    if (!html.includes('user-details-container') && !html.includes('rating-header')) {
      throw new Error(`CodeChef user '${username}' not found or profile is inaccessible.`);
    }

    // Rating
    let rating: number | null = null;
    const ratingMatch = html.match(/<div class="rating-number">\s*(\d+)\s*<\/div>/);
    if (ratingMatch && ratingMatch[1]) {
      rating = parseInt(ratingMatch[1], 10);
    }

    // Global Rank
    let rank: number | null = null;
    const rankMatch = html.match(/<strong class=['"]global-rank['"]>\s*(\d+)\s*<\/strong>/i) ||
                      html.match(/<strong>(\d+)<\/strong>\s*<small>Global Rank<\/small>/i);
    if (rankMatch && rankMatch[1]) {
      rank = parseInt(rankMatch[1], 10);
    }

    // Total Problems Solved
    let totalSolved = 0;
    const solvedMatch = html.match(/<h3>Total Problems Solved:\s*(\d+)<\/h3>/i) ||
                        html.match(/Fully Solved\s*\(\s*(\d+)\s*\)/i);
    if (solvedMatch && solvedMatch[1]) {
      totalSolved = parseInt(solvedMatch[1], 10);
    }

    // Contests & Rating History
    const contests: NormalizedContest[] = [];
    const activities: NormalizedActivity[] = [];
    const dateMap: Record<string, { solved: number; submissions: number }> = {};

    const allRatingMatch = html.match(/var\s+all_rating\s*=\s*(\[[^;]+\]);/);
    if (allRatingMatch && allRatingMatch[1]) {
      try {
        const ratingHistory = JSON.parse(allRatingMatch[1]);
        let prevRating: number | undefined = undefined;

        for (const item of ratingHistory) {
          const curRating = item.rating ? parseInt(item.rating, 10) : undefined;
          const change = curRating !== undefined && prevRating !== undefined ? curRating - prevRating : undefined;
          const contestDate = item.end_date ? new Date(item.end_date).toISOString() : new Date().toISOString();
          const dateOnly = contestDate.split('T')[0];

          contests.push({
            platform: 'codechef',
            external_contest_id: item.code || `cc_${item.name}`,
            name: item.name || 'CodeChef Contest',
            contest_date: contestDate,
            url: item.code ? `https://www.codechef.com/${item.code}` : undefined,
            rank: item.rank ? parseInt(item.rank, 10) : undefined,
            rating_before: prevRating,
            rating_after: curRating,
            rating_change: change
          });

          if (!dateMap[dateOnly]) {
            dateMap[dateOnly] = { solved: 0, submissions: 1 };
          } else {
            dateMap[dateOnly].submissions += 1;
          }

          if (curRating !== undefined) {
            prevRating = curRating;
          }
        }
      } catch {
        // ignore parse error
      }
    }

    // Extract solved problems list from HTML
    const recent_problems: NormalizedProblem[] = [];
    const probSectionMatch = html.match(/class="problems-solved"[\s\S]*?<\/section>/);
    if (probSectionMatch) {
      const probLinks = [...probSectionMatch[0].matchAll(/<a[^>]*href="\/problems\/([A-Za-z0-9_]+)"[^>]*>([^<]+)<\/a>/g)];
      if (totalSolved === 0 && probLinks.length > 0) {
        totalSolved = probLinks.length;
      }

      for (let i = 0; i < Math.min(probLinks.length, 20); i++) {
        const pSlug = probLinks[i][1];
        const pTitle = probLinks[i][2] || pSlug;
        recent_problems.push({
          platform: 'codechef',
          external_id: pSlug,
          title: pTitle,
          slug: pSlug,
          url: `https://www.codechef.com/problems/${pSlug}`,
          difficulty: 'Medium', // CodeChef difficulties are by division/points
          solved_at: new Date().toISOString()
        });
      }
    }

    for (const [date, act] of Object.entries(dateMap)) {
      activities.push({
        platform: 'codechef',
        activity_date: date,
        problems_solved: act.solved,
        submissions: act.submissions
      });
    }

    return {
      platform: 'codechef',
      username,
      profile_url: url,
      total_solved: totalSolved,
      easy_solved: Math.floor(totalSolved * 0.4),
      medium_solved: Math.floor(totalSolved * 0.45),
      hard_solved: Math.max(0, totalSolved - Math.floor(totalSolved * 0.4) - Math.floor(totalSolved * 0.45)),
      rating,
      rank,
      current_streak: 0,
      longest_streak: 0,
      total_submissions: totalSolved > 0 ? totalSolved * 2 : 0,
      active_days: Object.keys(dateMap).length,
      recent_problems,
      contests,
      activities
    };
  }
}
