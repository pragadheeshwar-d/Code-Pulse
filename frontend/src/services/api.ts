import {
  PlatformCardData,
  DashboardOverview,
  ChartPoint,
  HeatmapDay,
  DifficultyData,
  TopicData,
  RecentProblem,
  Goal,
  ContestRecord,
  SyncLog,
  UserProfile,
  UserSettings,
  PlatformType
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error(json.error || `Request failed with status ${res.status}`);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  getProfile: () => request<{ user: UserProfile; settings: UserSettings }>('/profile'),
  updateProfile: (data: Partial<UserProfile & UserSettings>) =>
    request<{ user: UserProfile; settings: UserSettings }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  getPlatforms: () => request<PlatformCardData[]>('/platforms'),
  connectPlatform: (platform: PlatformType, username: string) =>
    request<{ account: any; syncResult: any }>('/platforms/connect', {
      method: 'POST',
      body: JSON.stringify({ platform, username })
    }),
  disconnectPlatform: (platform: PlatformType) =>
    request<{ removed: boolean }>(`/platforms/${platform}`, {
      method: 'DELETE'
    }),

  syncAll: () => request<Record<PlatformType, { success: boolean; error?: string }>>('/sync', { method: 'POST' }),
  syncPlatform: (platform: PlatformType) => request<{ success: boolean; data?: any }>(`/sync/${platform}`, { method: 'POST' }),

  getStats: () => request<DashboardOverview>('/stats'),
  getStatsHistory: (period: string = '30d') => request<ChartPoint[]>(`/stats/history?period=${period}`),
  getProblems: (limit: number = 50) => request<RecentProblem[]>(`/problems?limit=${limit}`),
  getActivity: (platform?: string) => request<HeatmapDay[]>(`/activity${platform && platform !== 'all' ? `?platform=${platform}` : ''}`),

  getGoals: () => request<Goal[]>('/goals'),
  createGoal: (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'current' | 'progress_percentage'>) =>
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteGoal: (id: string) => request<{ deleted: boolean }>(`/goals/${id}`, { method: 'DELETE' }),

  getContests: () => request<ContestRecord[]>('/contests'),
  getAnalytics: () => request<{ difficulty: DifficultyData; topics: TopicData[]; insights: string[] }>('/analytics'),
  getSyncLogs: () => request<SyncLog[]>('/sync-logs')
};
