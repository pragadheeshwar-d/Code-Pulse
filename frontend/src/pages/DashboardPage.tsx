import React from 'react';
import {
  ListOrdered,
  Calendar,
  Flame,
  CloudUpload,
  Sparkles
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ProblemsChart } from '../components/ProblemsChart';
import { RecentActivityTable } from '../components/RecentActivityTable';
import {
  PlatformCardData,
  DashboardOverview,
  ChartPoint,
  RecentProblem,
  PlatformType
} from '../types';

interface DashboardPageProps {
  overview: DashboardOverview | null;
  platforms: PlatformCardData[];
  chartData: ChartPoint[];
  period: string;
  onPeriodChange: (period: string) => void;
  recentProblems: RecentProblem[];
  insights: string[];
  onConnectPlatform: (platform: PlatformType) => void;
  onViewAllProblems: () => void;
  activityData?: any;
  selectedPlatform?: string;
  onSelectPlatform?: (p: string) => void;
  difficultyData?: any;
  topicsData?: any;
  goals?: any[];
  onManagePlatform?: (platform: PlatformType) => void;
  onCreateGoal?: () => void;
  onViewAllGoals?: () => void;
  onDeleteGoal?: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  overview,
  platforms,
  chartData,
  period,
  onPeriodChange,
  recentProblems,
  insights,
  onConnectPlatform,
  onViewAllProblems
}) => {
  const anyConnected = platforms.some(p => p.connected);
  const totalSolvedFromPlatforms = platforms.reduce((sum, p) => sum + (p.stats?.total_solved || 0), 0);
  const activeDaysFromPlatforms = Math.max(0, ...platforms.map(p => p.stats?.active_days || 0));
  const currentStreakFromPlatforms = Math.max(0, ...platforms.map(p => p.stats?.current_streak || 0));
  const longestStreakFromPlatforms = Math.max(0, ...platforms.map(p => p.stats?.longest_streak || 0));
  const totalSubmissionsFromPlatforms = platforms.reduce((sum, p) => sum + (p.stats?.total_submissions || 0), 0);

  const effectiveHasData = (overview?.has_data ?? false) || (anyConnected && totalSolvedFromPlatforms > 0);
  const totalProblems = overview?.total_problems ?? (anyConnected && totalSolvedFromPlatforms > 0 ? totalSolvedFromPlatforms : null);
  const activeDays = overview?.active_days ?? (anyConnected && activeDaysFromPlatforms > 0 ? activeDaysFromPlatforms : null);
  const currentStreak = overview?.current_streak ?? (anyConnected && currentStreakFromPlatforms >= 0 ? currentStreakFromPlatforms : null);
  const longestStreak = overview?.longest_streak ?? (anyConnected && longestStreakFromPlatforms > 0 ? longestStreakFromPlatforms : null);
  const totalSubmissions = overview?.total_submissions ?? (anyConnected && totalSubmissionsFromPlatforms > 0 ? totalSubmissionsFromPlatforms : null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6">
      {/* 0. Hero Greeting Banner */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 shadow-sm">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
            {getGreeting()}, Developer
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Verified competitive programming stats & problem-solving progression
          </p>
        </div>
        {currentStreak !== null && currentStreak !== undefined ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--warm)]/10 border border-[var(--warm)]/20 text-[var(--warm)] self-start sm:self-auto font-mono text-xs font-semibold shrink-0 whitespace-nowrap">
            <Flame className="w-4 h-4 text-[var(--warm)] shrink-0" />
            <span>{currentStreak} Day Active Streak</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 text-[var(--accent)] self-start sm:self-auto text-xs font-medium shrink-0 whitespace-nowrap">
            <span>Real-time Sync Active</span>
          </div>
        )}
      </div>

      {/* 1. Essential Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 xl:gap-4">
        <MetricCard
          title="Total Problems Solved"
          value={totalProblems}
          icon={ListOrdered}
          iconColor="text-[var(--accent)]"
          hasData={effectiveHasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Active Solving Days"
          value={activeDays}
          icon={Calendar}
          iconColor="text-[var(--accent)]"
          hasData={effectiveHasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Current Active Streak"
          value={effectiveHasData && currentStreak !== null && currentStreak !== undefined ? `${currentStreak} day${currentStreak === 1 ? '' : 's'}` : null}
          icon={Flame}
          iconColor="text-[var(--warm)]"
          hasData={effectiveHasData}
          badge={effectiveHasData && longestStreak ? `Max: ${longestStreak}d` : undefined}
          subtitle={effectiveHasData && longestStreak ? `Max streak: ${longestStreak} days` : 'Verified stats'}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={CloudUpload}
          iconColor="text-[var(--accent)]"
          hasData={effectiveHasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
      </div>

      {/* 2. Main Essential Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 xl:gap-6">
        {/* Left Column (Span 2): Solved Trajectory Chart */}
        <div className="lg:col-span-2">
          <ProblemsChart
            data={chartData}
            period={period}
            onPeriodChange={onPeriodChange}
            hasConnectedPlatforms={anyConnected}
            onConnectClick={() => onConnectPlatform('leetcode')}
          />
        </div>

        {/* Right Column (Span 1): Recent Submissions */}
        <div className="lg:col-span-1">
          <RecentActivityTable
            problems={recentProblems}
            onViewAllClick={onViewAllProblems}
            limit={6}
          />
        </div>
      </div>

      {/* 3. Performance Insights */}
      {insights.length > 0 && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex items-start gap-3 shadow-sm">
          <div className="w-7 h-7 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-[var(--text)] tracking-wide uppercase font-mono">Performance Insights</h4>
            <div className="mt-1.5 space-y-1">
              {insights.map((ins, i) => (
                <p key={i} className="text-xs text-[var(--text)]/90 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span>{ins}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
