import { BaseCollector } from './base.collector.js';
import { NormalizedProfileData, NormalizedProblem, NormalizedContest, NormalizedActivity } from '../types/index.js';

export class CodeforcesCollector extends BaseCollector {
  readonly platform = 'codeforces' as const;

  async validateUsername(username: string): Promise<boolean> {
    try {
      const res = await this.fetchWithTimeout(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`);
      if (!res.ok) return false;
      const data: any = await res.json();
      return data.status === 'OK' && Array.isArray(data.result) && data.result.length > 0;
    } catch {
      return false;
    }
  }

  async fetchProfile(username: string): Promise<NormalizedProfileData> {
    // 1. Fetch user info
    const infoRes = await this.fetchWithTimeout(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`);
    if (!infoRes.ok) {
      throw new Error(`Codeforces API error: HTTP ${infoRes.status}`);
    }
    const infoData: any = await infoRes.json();
    if (infoData.status !== 'OK' || !infoData.result?.[0]) {
      throw new Error(`Codeforces user '${username}' not found.`);
    }
    const user = infoData.result[0];

    // 2. Fetch submissions
    let submissions: any[] = [];
    try {
      const statusRes = await this.fetchWithTimeout(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=500`);
      if (statusRes.ok) {
        const statusData: any = await statusRes.json();
        if (statusData.status === 'OK' && Array.isArray(statusData.result)) {
          submissions = statusData.result;
        }
      }
    } catch {
      // Continue even if submissions fail
    }

    // 3. Fetch rating history / contests
    let contestHistory: any[] = [];
    try {
      const ratingRes = await this.fetchWithTimeout(`https://codeforces.com/api/user.rating?handle=${encodeURIComponent(username)}`);
      if (ratingRes.ok) {
        const ratingData: any = await ratingRes.json();
        if (ratingData.status === 'OK' && Array.isArray(ratingData.result)) {
          contestHistory = ratingData.result;
        }
      }
    } catch {
      // Continue even if contest history fails
    }

    // Process submissions
    const solvedSet = new Set<string>();
    const recent_problems: NormalizedProblem[] = [];
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    const topics: Record<string, number> = {};
    const dateActivityMap: Record<string, { solved: number; submissions: number }> = {};

    for (const sub of submissions) {
      const subDate = new Date(sub.creationTimeSeconds * 1000).toISOString().split('T')[0];
      if (!dateActivityMap[subDate]) {
        dateActivityMap[subDate] = { solved: 0, submissions: 0 };
      }
      dateActivityMap[subDate].submissions += 1;

      if (sub.verdict === 'OK' && sub.problem) {
        const probId = `${sub.problem.contestId || ''}${sub.problem.index || sub.problem.name}`;
        if (!solvedSet.has(probId)) {
          solvedSet.add(probId);
          dateActivityMap[subDate].solved += 1;

          // Difficulty categorization
          const rating = sub.problem.rating;
          let diff: 'Easy' | 'Medium' | 'Hard' | 'Other' = 'Other';
          if (typeof rating === 'number') {
            if (rating < 1200) {
              diff = 'Easy';
              easySolved++;
            } else if (rating <= 1800) {
              diff = 'Medium';
              mediumSolved++;
            } else {
              diff = 'Hard';
              hardSolved++;
            }
          } else {
            diff = 'Medium';
            mediumSolved++;
          }

          // Topic tags mapping
          if (Array.isArray(sub.problem.tags)) {
            for (const tag of sub.problem.tags) {
              const formattedTag = this.formatTag(tag);
              topics[formattedTag] = (topics[formattedTag] || 0) + 1;
            }
          }

          if (recent_problems.length < 20) {
            recent_problems.push({
              platform: 'codeforces',
              external_id: probId,
              title: `${sub.problem.index ? sub.problem.index + '. ' : ''}${sub.problem.name}`,
              slug: probId,
              url: sub.problem.contestId
                ? `https://codeforces.com/contest/${sub.problem.contestId}/problem/${sub.problem.index}`
                : `https://codeforces.com/problemset/problem/${sub.problem.contestId}/${sub.problem.index}`,
              difficulty: diff,
              topic: sub.problem.tags?.[0] ? this.formatTag(sub.problem.tags[0]) : undefined,
              solved_at: new Date(sub.creationTimeSeconds * 1000).toISOString()
            });
          }
        }
      }
    }

    const totalSolved = solvedSet.size;

    // Convert activity map to array
    const activities: NormalizedActivity[] = Object.entries(dateActivityMap).map(([date, act]) => ({
      platform: 'codeforces',
      activity_date: date,
      problems_solved: act.solved,
      submissions: act.submissions
    }));

    // Calculate streaks from activity dates
    const activeDates = Object.keys(dateActivityMap).sort();
    const { currentStreak, longestStreak } = this.calculateStreaks(activeDates);

    // Contests
    const contests: NormalizedContest[] = contestHistory.map((c: any) => ({
      platform: 'codeforces',
      external_contest_id: String(c.contestId),
      name: c.contestName,
      contest_date: new Date(c.ratingUpdateTimeSeconds * 1000).toISOString(),
      url: `https://codeforces.com/contest/${c.contestId}`,
      rank: c.rank,
      rating_before: c.oldRating,
      rating_after: c.newRating,
      rating_change: c.newRating - c.oldRating
    }));

    return {
      platform: 'codeforces',
      username: user.handle,
      profile_url: `https://codeforces.com/profile/${user.handle}`,
      total_solved: totalSolved,
      easy_solved: easySolved,
      medium_solved: mediumSolved,
      hard_solved: hardSolved,
      rating: user.rating || null,
      rank: null, // CF uses title (e.g. candidate master), not numeric global rank
      current_streak: currentStreak,
      longest_streak: longestStreak,
      total_submissions: submissions.length,
      active_days: activeDates.length,
      topics,
      recent_problems,
      contests,
      activities
    };
  }

  private formatTag(tag: string): string {
    const map: Record<string, string> = {
      dp: 'Dynamic Programming',
      greedy: 'Greedy',
      math: 'Math',
      'data structures': 'Data Structures',
      dfs: 'Depth-First Search',
      bfs: 'Breadth-First Search',
      trees: 'Trees',
      graphs: 'Graphs',
      strings: 'Strings',
      'binary search': 'Binary Search',
      sortings: 'Sorting',
      'two pointers': 'Two Pointers',
      'bit manipulation': 'Bit Manipulation',
      implementation: 'Implementation'
    };
    return map[tag.toLowerCase()] || tag.charAt(0).toUpperCase() + tag.slice(1);
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
