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

const API_BASE = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api';
const TOKEN_KEY = 'codepulse_session_token';
const LEGACY_TOKEN_KEY = 'codepulse_token';

export function getAuthToken(): string | null {
  // Keep credentials only for the active browser session. Opening CodePulse in a
  // new session will therefore present the sign-in screen before any dashboard
  // data is rendered.
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  // A previous version stored tokens persistently. Remove it so it cannot
  // silently bypass the sign-in screen after this update.
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export function removeAuthToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options.headers as Record<string, string>) || {})
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  let json: any = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }

  if (!json) {
    const rawText = await res.text().catch(() => '');
    const cleanMsg = rawText.includes('Internal Server Error')
      ? 'Server encountered an issue connecting to this platform profile. Please verify the handle and ensure profile is public.'
      : (rawText || `Request failed with status ${res.status}`);
    throw new Error(cleanMsg);
  }

  if (!res.ok || json.success === false) {
    let errMsg = json.error || `Request failed with status ${res.status}`;
    if (errMsg.toLowerCase().includes('invalid username') || errMsg.toLowerCase().includes('not found')) {
      errMsg = `${errMsg}. Please ensure the handle is spelled correctly and public on the platform.`;
    }
    throw new Error(errMsg);
  }

  return json.data !== undefined ? json.data : json;
}

export const api = {
  // Authentication
  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  register: (data: { name: string; email: string; password: string; headline?: string }) =>
    request<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getMe: () => request<{ user: UserProfile; settings: UserSettings }>('/auth/me'),

  logout: () => {
    removeAuthToken();
    return request<{ success: boolean; message: string }>('/auth/logout', { method: 'POST' }).catch(() => {});
  },

  // Profile
  getProfile: () => request<{ user: UserProfile; settings: UserSettings }>('/profile'),
  updateProfile: (data: Partial<UserProfile & UserSettings>) =>
    request<{ user: UserProfile; settings: UserSettings }>('/profile', {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Platforms
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

  // Stats & Visualizations
  getStats: () => request<DashboardOverview>('/stats'),
  getStatsHistory: (period: string = '30d') => request<ChartPoint[]>(`/stats/history?period=${period}`),
  getProblems: (limit: number = 500) => request<RecentProblem[]>(`/problems?limit=${limit}`),
  getActivity: (platform?: string) => request<HeatmapDay[]>(`/activity${platform && platform !== 'all' ? `?platform=${platform}` : ''}`),

  // Goals
  getGoals: () => request<Goal[]>('/goals'),
  createGoal: (data: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'status' | 'current' | 'progress_percentage'>) =>
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  deleteGoal: (id: string) => request<{ deleted: boolean }>(`/goals/${id}`, { method: 'DELETE' }),

  // Contests & Analytics
  getContests: () => request<ContestRecord[]>('/contests'),
  getAnalytics: () => request<{ difficulty: DifficultyData; topics: TopicData[]; insights: string[] }>('/analytics'),
  getSyncLogs: () => request<SyncLog[]>('/sync-logs'),

  // Dedicated Domain Endpoints
  getStreaks: () => request<any>('/streaks'),
  getProgress: (period: string = '30d') => request<any>(`/progress?period=${period}`),
  getLeetCode: () => request<any>('/leetcode'),
  getCodeChef: () => request<any>('/codechef'),
  getGFG: () => request<any>('/gfg'),
  getCodeforces: () => request<any>('/codeforces'),
  getGitHub: (username?: string) => request<any>(`/github${username ? `?username=${username}` : ''}`)
};
