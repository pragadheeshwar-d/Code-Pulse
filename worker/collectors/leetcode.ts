import { BaseCollector } from './base';
import { NormalizedProfileData, NormalizedProblem, NormalizedContest, NormalizedActivity } from '../types';

export class LeetCodeCollector extends BaseCollector {
  readonly platform = 'leetcode' as const;
  private readonly graphqlEndpoint = 'https://leetcode.com/graphql';
  private static questionMetaCache = new Map<string, { difficulty: 'Easy' | 'Medium' | 'Hard' | 'Other', topic?: string }>();

  private async getQuestionMeta(titleSlug: string): Promise<{ difficulty: 'Easy' | 'Medium' | 'Hard' | 'Other', topic?: string }> {
    if (LeetCodeCollector.questionMetaCache.has(titleSlug)) {
      return LeetCodeCollector.questionMetaCache.get(titleSlug)!;
    }

    try {
      const query = `
        query questionTitle($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            difficulty
            topicTags { name }
          }
        }
      `;
      const res = await this.fetchWithTimeout(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        },
        body: JSON.stringify({ query, variables: { titleSlug } })
      }, 5000);

      if (res.ok) {
        const data: any = await res.json();
        const q = data?.data?.question;
        const diff = (q?.difficulty === 'Easy' || q?.difficulty === 'Medium' || q?.difficulty === 'Hard')
          ? q.difficulty
          : 'Other';
        const topic = q?.topicTags?.[0]?.name;
        const result = { difficulty: diff as 'Easy' | 'Medium' | 'Hard' | 'Other', topic };
        LeetCodeCollector.questionMetaCache.set(titleSlug, result);
        return result;
      }
    } catch {
      // Fallback if network fails
    }

    return { difficulty: 'Other' };
  }

  async validateUsername(username: string): Promise<boolean> {
    try {
      const query = `
        query checkUser($username: String!) {
          matchedUser(username: $username) {
            username
          }
        }
      `;
      const res = await this.fetchWithTimeout(this.graphqlEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://leetcode.com'
        },
        body: JSON.stringify({ query, variables: { username } })
      });

      if (!res.ok) return false;
      const data: any = await res.json();
      return !!data?.data?.matchedUser?.username;
    } catch {
      return false;
    }
  }

  async fetchProfile(username: string): Promise<NormalizedProfileData> {
    const query = `
      query getFullProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
              submissions
            }
          }
          userCalendar {
            streak
            totalActiveDays
            submissionCalendar
          }
          tagProblemCounts {
            advanced { tagName problemsSolved }
            intermediate { tagName problemsSolved }
            fundamental { tagName problemsSolved }
          }
        }
        userContestRanking(username: $username) {
          attendedContestsCount
          rating
          globalRanking
          totalParticipants
          topPercentage
        }
        userContestRankingHistory(username: $username) {
          attended
          rating
          ranking
          contest {
            title
            startTime
          }
        }
        recentAcSubmissionList(username: $username, limit: 20) {
          id
          title
          titleSlug
          timestamp
        }
      }
    `;

    const res = await this.fetchWithTimeout(this.graphqlEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({ query, variables: { username } })
    });

    if (!res.ok) {
      throw new Error(`LeetCode GraphQL error: HTTP ${res.status}`);
    }

    const json: any = await res.json();
    const user = json?.data?.matchedUser;
    if (!user) {
      throw new Error(`LeetCode user '${username}' not found or profile is private.`);
    }

    // Solved stats
    const acStats = user.submitStats?.acSubmissionNum || [];
    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;
    let totalSubmissions = 0;

    for (const stat of acStats) {
      if (stat.difficulty === 'All') {
        totalSolved = stat.count || 0;
        totalSubmissions = stat.submissions || 0;
      } else if (stat.difficulty === 'Easy') {
        easySolved = stat.count || 0;
      } else if (stat.difficulty === 'Medium') {
        mediumSolved = stat.count || 0;
      } else if (stat.difficulty === 'Hard') {
        hardSolved = stat.count || 0;
      }
    }

    // Contest stats
    const contestRanking = json?.data?.userContestRanking;
    const rating = contestRanking?.rating ? Math.round(contestRanking.rating) : null;
    const rank = contestRanking?.globalRanking || user.profile?.ranking || null;

    // Contests history
    const contestHistoryRaw = json?.data?.userContestRankingHistory || [];
    const contests: NormalizedContest[] = [];
    let prevRating: number | undefined = undefined;

    for (const item of contestHistoryRaw) {
      if (item.attended) {
        const curRating = item.rating ? Math.round(item.rating) : undefined;
        const change = curRating !== undefined && prevRating !== undefined ? curRating - prevRating : undefined;
        const contestDate = item.contest?.startTime
          ? new Date(item.contest.startTime * 1000).toISOString()
          : new Date().toISOString();

        contests.push({
          platform: 'leetcode',
          external_contest_id: item.contest?.title || `lc_contest_${item.contest?.startTime}`,
          name: item.contest?.title || 'LeetCode Weekly/Biweekly Contest',
          contest_date: contestDate,
          url: `https://leetcode.com/contest/`,
          rank: item.ranking,
          rating_before: prevRating,
          rating_after: curRating,
          rating_change: change
        });

        if (curRating !== undefined) {
          prevRating = curRating;
        }
      }
    }

    // Recent problems with authentic difficulty and topic resolved from LeetCode
    const recentSubmissionsRaw = json?.data?.recentAcSubmissionList || [];
    const recent_problems: NormalizedProblem[] = await Promise.all(
      recentSubmissionsRaw.slice(0, 20).map(async (sub: any) => {
        const meta = await this.getQuestionMeta(sub.titleSlug);
        return {
          platform: 'leetcode' as const,
          external_id: sub.id || sub.titleSlug,
          title: sub.title,
          slug: sub.titleSlug,
          url: `https://leetcode.com/problems/${sub.titleSlug}/`,
          difficulty: meta.difficulty,
          topic: meta.topic,
          solved_at: new Date(parseInt(sub.timestamp, 10) * 1000).toISOString()
        };
      })
    );

    // Activities from submissionCalendar
    const activities: NormalizedActivity[] = [];
    const calendarStr = user.userCalendar?.submissionCalendar;
    if (calendarStr) {
      try {
        const cal = JSON.parse(calendarStr);
        for (const [epochSecStr, count] of Object.entries(cal)) {
          const epoch = parseInt(epochSecStr, 10);
          const dateStr = new Date(epoch * 1000).toISOString().split('T')[0];
          activities.push({
            platform: 'leetcode',
            activity_date: dateStr,
            problems_solved: typeof count === 'number' ? count : 1,
            submissions: typeof count === 'number' ? count : 1
          });
        }
      } catch {
        // ignore parse error
      }
    }

    // Topic tags
    const topics: Record<string, number> = {};
    const tagGroups = user.tagProblemCounts;
    if (tagGroups) {
      const allTags = [
        ...(tagGroups.fundamental || []),
        ...(tagGroups.intermediate || []),
        ...(tagGroups.advanced || [])
      ];
      for (const t of allTags) {
        if (t.tagName && t.problemsSolved > 0) {
          topics[t.tagName] = (topics[t.tagName] || 0) + t.problemsSolved;
        }
      }
    }

    return {
      platform: 'leetcode',
      username,
      profile_url: `https://leetcode.com/${username}/`,
      total_solved: totalSolved,
      easy_solved: easySolved,
      medium_solved: mediumSolved,
      hard_solved: hardSolved,
      rating,
      rank,
      current_streak: user.userCalendar?.streak || 0,
      longest_streak: user.userCalendar?.streak || 0, // LC API gives current streak, we maintain longest in snapshot
      total_submissions: totalSubmissions,
      active_days: user.userCalendar?.totalActiveDays || 0,
      topics,
      recent_problems,
      contests,
      activities
    };
  }
}
