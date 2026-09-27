export type PlatformType = 'leetcode' | 'codechef' | 'geeksforgeeks' | 'codeforces';

export interface User {
  id: string;
  name: string;
  email?: string;
  headline?: string;
  created_at: string;
  updated_at: string;
}

export interface PlatformAccount {
  id: string;
  user_id: string;
  platform: PlatformType;
  username: string;
  profile_url: string;
  connection_status: 'connected' | 'error' | 'disconnected';
  last_synced_at: string | null;
  last_error?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NormalizedProblem {
  platform: PlatformType;
  external_id: string;
  title: string;
  slug?: string;
  url?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Other';
  topic?: string;
  solved_at: string;
}

export interface NormalizedContest {
  platform: PlatformType;
  external_contest_id: string;
  name: string;
  contest_date: string;
  url?: string;
  rank?: number;
  problems_solved?: number;
  rating_before?: number;
  rating_after?: number;
  rating_change?: number;
}

export interface NormalizedActivity {
  platform: PlatformType;
  activity_date: string; // YYYY-MM-DD
  problems_solved: number;
  submissions: number;
  rating_change?: number;
  metadata?: Record<string, any>;
}

export interface NormalizedProfileData {
  platform: PlatformType;
  username: string;
  profile_url: string;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  rating: number | null;
  rank: number | null;
  current_streak: number;
  longest_streak: number;
  total_submissions: number;
  active_days: number;
  topics?: Record<string, number>; // topic name -> solved count
  recent_problems: NormalizedProblem[];
  contests: NormalizedContest[];
  activities: NormalizedActivity[];
  raw_metadata?: Record<string, any>;
}

export interface StatSnapshot {
  id: string;
  platform_account_id: string;
  user_id: string;
  platform: PlatformType;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  rating: number | null;
  rank: number | null;
  current_streak: number;
  longest_streak: number;
  total_submissions: number;
  active_days: number;
  recorded_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  goal_type: 'problems_solved' | 'active_days' | 'contest_rating' | 'contest_count' | 'platform_solved';
  target: number;
  platform?: PlatformType | null;
  start_date: string;
  end_date: string;
  status: 'active' | 'completed' | 'expired';
  current?: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  id: string;
  user_id: string;
  platform: PlatformType;
  status: 'success' | 'failed' | 'in_progress';
  started_at: string;
  completed_at: string | null;
  records_processed: number;
  error_message: string | null;
}
