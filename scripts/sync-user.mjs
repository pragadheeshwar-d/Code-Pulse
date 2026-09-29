import { LeetCodeCollector } from '../backend/dist/collectors/leetcode.collector.js';
import { CodeChefCollector } from '../backend/dist/collectors/codechef.collector.js';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';

async function syncUser(userId) {
  console.log(`[Sync] Starting sync for user: ${userId}`);

  const lcCollector = new LeetCodeCollector();
  const ccCollector = new CodeChefCollector();

  const lcData = await lcCollector.fetchProfile('pragadheeshward');
  const ccData = await ccCollector.fetchProfile('pragadhees_06');

  const statements = [];

  function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    return "'" + String(str).replace(/'/g, "''") + "'";
  }

  // 1. Process LeetCode
  {
    const platform = 'leetcode';
    const accId = '8f06250a-fed7-470b-9b61-38ae155a53cc';
    statements.push(`UPDATE platform_accounts SET connection_status = 'connected', last_synced_at = datetime('now'), last_error = NULL WHERE id = '${accId}';`);

    const snapId = crypto.randomUUID();
    statements.push(`INSERT INTO stat_snapshots (id, platform_account_id, user_id, platform, total_solved, easy_solved, medium_solved, hard_solved, rating, rank, current_streak, longest_streak, total_submissions, active_days, recorded_at) VALUES ('${snapId}', '${accId}', '${userId}', '${platform}', ${lcData.total_solved}, ${lcData.easy_solved}, ${lcData.medium_solved}, ${lcData.hard_solved}, ${lcData.rating || 'NULL'}, ${lcData.rank || 'NULL'}, ${lcData.current_streak}, ${lcData.longest_streak}, ${lcData.total_submissions}, ${lcData.active_days}, datetime('now'));`);

    for (const p of lcData.recent_problems) {
      const problemId = `${platform}_${p.external_id}`;
      statements.push(`INSERT INTO problems (id, platform, external_problem_id, title, slug, url, difficulty, topic, created_at) VALUES ('${problemId}', '${platform}', ${escapeSql(p.external_id)}, ${escapeSql(p.title)}, ${escapeSql(p.slug)}, ${escapeSql(p.url)}, ${escapeSql(p.difficulty)}, ${escapeSql(p.topic)}, datetime('now')) ON CONFLICT(platform, external_problem_id) DO UPDATE SET title = excluded.title, difficulty = excluded.difficulty, topic = COALESCE(excluded.topic, problems.topic);`);
      statements.push(`INSERT INTO user_problems (id, user_id, problem_id, solved_at, first_seen_at) VALUES ('${userId}_${problemId}', '${userId}', '${problemId}', ${escapeSql(p.solved_at)}, datetime('now')) ON CONFLICT(user_id, problem_id) DO UPDATE SET solved_at = excluded.solved_at;`);
    }

    for (const a of lcData.activities) {
      const actId = `${userId}_${platform}_${a.activity_date}`;
      statements.push(`INSERT INTO activity_records (id, user_id, platform, activity_date, problems_solved, submissions, rating_change) VALUES ('${actId}', '${userId}', '${platform}', '${a.activity_date}', ${a.problems_solved}, ${a.submissions}, NULL) ON CONFLICT(user_id, platform, activity_date) DO UPDATE SET problems_solved = MAX(activity_records.problems_solved, excluded.problems_solved), submissions = MAX(activity_records.submissions, excluded.submissions);`);
    }

    if (lcData.topics) {
      for (const [topic, count] of Object.entries(lcData.topics)) {
        if (count > 0) {
          const topicId = `${userId}_${platform}_${topic}`;
          statements.push(`INSERT INTO platform_topics (id, user_id, platform, topic, problem_count, updated_at) VALUES ('${topicId}', '${userId}', '${platform}', ${escapeSql(topic)}, ${count}, datetime('now')) ON CONFLICT(user_id, platform, topic) DO UPDATE SET problem_count = excluded.problem_count, updated_at = datetime('now');`);
        }
      }
    }
  }

  // 2. Process CodeChef
  {
    const platform = 'codechef';
    const accId = '57f0c347-ed8f-4d33-9785-ddbe9c02aada';
    statements.push(`UPDATE platform_accounts SET connection_status = 'connected', last_synced_at = datetime('now'), last_error = NULL WHERE id = '${accId}';`);

    const snapId = crypto.randomUUID();
    statements.push(`INSERT INTO stat_snapshots (id, platform_account_id, user_id, platform, total_solved, easy_solved, medium_solved, hard_solved, rating, rank, current_streak, longest_streak, total_submissions, active_days, recorded_at) VALUES ('${snapId}', '${accId}', '${userId}', '${platform}', ${ccData.total_solved}, ${ccData.easy_solved}, ${ccData.medium_solved}, ${ccData.hard_solved}, ${ccData.rating || 'NULL'}, ${ccData.rank || 'NULL'}, ${ccData.current_streak}, ${ccData.longest_streak}, ${ccData.total_submissions}, ${ccData.active_days}, datetime('now'));`);

    for (const a of ccData.activities) {
      const actId = `${userId}_${platform}_${a.activity_date}`;
      statements.push(`INSERT INTO activity_records (id, user_id, platform, activity_date, problems_solved, submissions, rating_change) VALUES ('${actId}', '${userId}', '${platform}', '${a.activity_date}', ${a.problems_solved}, ${a.submissions}, NULL) ON CONFLICT(user_id, platform, activity_date) DO UPDATE SET problems_solved = MAX(activity_records.problems_solved, excluded.problems_solved), submissions = MAX(activity_records.submissions, excluded.submissions);`);
    }

    if (ccData.topics) {
      for (const [topic, count] of Object.entries(ccData.topics)) {
        if (count > 0) {
          const topicId = `${userId}_${platform}_${topic}`;
          statements.push(`INSERT INTO platform_topics (id, user_id, platform, topic, problem_count, updated_at) VALUES ('${topicId}', '${userId}', '${platform}', ${escapeSql(topic)}, ${count}, datetime('now')) ON CONFLICT(user_id, platform, topic) DO UPDATE SET problem_count = excluded.problem_count, updated_at = datetime('now');`);
        }
      }
    }
  }

  // Write SQL file
  const sqlFile = 'temp_sync.sql';
  fs.writeFileSync(sqlFile, statements.join('\n'));
  console.log(`[Sync] Wrote ${statements.length} SQL statements to ${sqlFile}`);

  // Execute via wrangler
  try {
    execSync(`npx wrangler d1 execute codepulse-db --remote --file=${sqlFile}`, { stdio: 'inherit' });
    console.log('[Sync] Remote D1 sync successful!');
  } finally {
    if (fs.existsSync(sqlFile)) {
      fs.unlinkSync(sqlFile);
    }
  }
}

syncUser('usr_eb87bff6-9670-4a8f-b81c-b3b13d3533ba').catch(console.error);
