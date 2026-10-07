export type PlatformType = 'leetcode' | 'codechef' | 'geeksforgeeks' | 'codeforces';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  headline?: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  auto_sync_interval: 'manual' | '6h' | '12h' | '24h';
  theme: string;
  notifications_enabled: number;
}

export interface PlatformCardData {
  id?: string;
  platform: PlatformType;
  connected: boolean;
  username: string | null;
  profile_url: string | null;
  last_synced_at: string | null;
  connection_status: 'connected' | 'error' | 'not_connected';
  last_error?: string | null;
  stats: {
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
  } | null;
}

export interface DashboardOverview {
  has_data: boolean;
  total_problems: number | null;
  active_days: number | null;
  current_streak: number | null;
  longest_streak: number | null;
  total_submissions: number | null;
  last_synced_at: string | null;
}

export interface ChartPoint {
  date: string;
  daily: number;
  cumulative: number;
}

export interface HeatmapDay {
  date: string;
  count: number;
  problems_solved: number;
  submissions: number;
  platforms: string[];
  level: number; // 0, 1, 2, 3, 4
}

export interface DifficultyData {
  easy: { count: number; percentage: number };
  medium: { count: number; percentage: number };
  hard: { count: number; percentage: number };
  total: number;
}

export interface TopicData {
  name: string;
  count: number;
  percentage: number;
}

export interface RecentProblem {
  id?: string;
  platform: PlatformType;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Other';
  topic?: string;
  date: string;
  url?: string;
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
  status: 'active' | 'completed' | 'expired' | 'failed';
  current?: number;
  progress_percentage?: number;
  created_at: string;
  updated_at: string;
}

export interface ContestRecord {
  id?: string;
  platform: PlatformType;
  external_contest_id?: string;
  name: string;
  contest_date: string;
  url?: string;
  rank?: number;
  problems_solved?: number;
  rating_before?: number;
  rating_after?: number;
  rating_change?: number;
}

export interface SyncLog {
  id: string;
  platform: PlatformType;
  status: 'success' | 'completed' | 'failed' | 'in_progress';
  started_at: string;
  completed_at: string | null;
  records_processed: number;
  error_message: string | null;
}
