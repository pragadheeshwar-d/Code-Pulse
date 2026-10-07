import React from 'react';
import {
  ListOrdered,
  Calendar,
  Flame,
  CloudUpload,
  Target,
  ArrowRight,
  Plus,
  Sparkles,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { ProblemsChart } from '../components/ProblemsChart';
import { RecentActivityTable } from '../components/RecentActivityTable';
import {
  PlatformCardData,
  DashboardOverview,
  ChartPoint,
  RecentProblem,
  PlatformType,
  Goal
} from '../types';

interface DashboardPageProps {
  overview: DashboardOverview | null;
  platforms: PlatformCardData[];
  chartData: ChartPoint[];
  period: string;
  onPeriodChange: (period: string) => void;
  recentProblems: RecentProblem[];
  insights: string[];
  goals?: Goal[];
  onConnectPlatform: (platform: PlatformType) => void;
  onViewAllProblems: () => void;
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
  goals = [],
  onConnectPlatform,
  onViewAllProblems,
  onCreateGoal,
  onViewAllGoals
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
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Find active focus goal
  const activeGoals = goals.filter(g => g.status === 'active');
  const todayGoal = activeGoals[0] || null;

  // Contextual activity message
  const getContextualMessage = () => {
    if (!anyConnected) {
      return 'Connect your competitive programming accounts to track problems and streaks.';
    }
    if (todayGoal) {
      const remaining = Math.max(0, todayGoal.target - (todayGoal.current || 0));
      if (remaining === 0) {
        return 'Today’s primary goal achieved! Great work keeping momentum.';
      }
      return `Keep the momentum going. ${remaining} ${todayGoal.goal_type === 'problems_solved' ? 'problems' : 'units'} left to complete your goal.`;
    }
    if (currentStreak && currentStreak > 0) {
      return `You have an active ${currentStreak}-day coding streak. Keep it alive today!`;
    }
    return 'Track what you solved today and plan what to solve next.';
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Contextual Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[var(--text)] tracking-tight">
            {getGreeting()}, Developer
          </h2>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {getContextualMessage()}
          </p>
        </div>

        {currentStreak !== null && currentStreak !== undefined && currentStreak > 0 ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--warm-muted)] border border-[var(--warm)]/20 text-[var(--warm)] text-xs font-mono font-medium shrink-0 self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-[var(--warm)] shrink-0" />
            <span>{currentStreak} Day Streak</span>
            {longestStreak && longestStreak > currentStreak && (
              <span className="text-[10px] text-[var(--muted)] border-l border-[var(--warm)]/30 pl-2">
                Best: {longestStreak}d
              </span>
            )}
          </div>
        ) : null}
      </div>

      {/* 2. Key Metrics Row (Compact, dense developer layout) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Problems Solved"
          value={totalProblems}
          icon={ListOrdered}
          iconColor="text-[var(--accent)]"
          hasData={effectiveHasData}
          subtitle="Verified solves"
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Active Days"
          value={activeDays}
          icon={Calendar}
          iconColor="text-[var(--accent)]"
          hasData={effectiveHasData}
          subtitle="Days with activity"
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Current Streak"
          value={effectiveHasData && currentStreak !== null && currentStreak !== undefined ? `${currentStreak}d` : null}
          icon={Flame}
          iconColor="text-[var(--warm)]"
          hasData={effectiveHasData}
          badge={effectiveHasData && longestStreak ? `Max ${longestStreak}d` : undefined}
          subtitle={effectiveHasData && longestStreak ? `Max: ${longestStreak} days` : 'Consecutive days'}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={CloudUpload}
          iconColor="text-[var(--accent)]"
          hasData={effectiveHasData}
          subtitle="Across all handles"
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
      </div>

      {/* 3. Today's Focus Card */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-[var(--accent)]" />
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text)]">
              Today&apos;s Focus
            </h3>
          </div>
          {todayGoal && (
            <button
              onClick={onViewAllGoals}
              className="text-xs text-[var(--muted)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
            >
              <span>All goals ({goals.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {todayGoal ? (
          <div className="pt-3.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-[var(--text)] font-sans">
                  {todayGoal.title}
                </h4>
                <p className="text-xs text-[var(--muted)] capitalize mt-0.5 font-mono">
                  {todayGoal.platform || 'All platforms'} · {todayGoal.goal_type.replace(/_/g, ' ')}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold text-[var(--text)]">
                  {todayGoal.current || 0} / {todayGoal.target}
                </span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-[var(--surface-active)] text-[var(--accent)] border border-[var(--border)] font-semibold">
                  {todayGoal.progress_percentage || 0}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-500"
                style={{ width: `${Math.min(todayGoal.progress_percentage || 0, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-[var(--muted)] pt-0.5">
              <span>
                {Math.max(0, todayGoal.target - (todayGoal.current || 0))} remaining to achieve goal
              </span>
              <button
                onClick={onViewAllGoals}
                className="text-[var(--accent)] hover:underline font-medium flex items-center gap-1"
              >
                <span>Continue</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-medium text-[var(--text)]">No active coding goals</p>
              <p className="text-[var(--muted)] mt-0.5">
                Set a daily problem count, rating milestone, or contest target to track progression.
              </p>
            </div>
            {onCreateGoal && (
              <button
                onClick={onCreateGoal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] font-semibold text-xs hover:opacity-90 transition shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create goal</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Trajectory Chart & Recent Solves Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <ProblemsChart
            data={chartData}
            period={period}
            onPeriodChange={onPeriodChange}
            hasConnectedPlatforms={anyConnected}
            onConnectClick={() => onConnectPlatform('leetcode')}
          />
        </div>

        <div className="lg:col-span-1">
          <RecentActivityTable
            problems={recentProblems}
            onViewAllClick={onViewAllProblems}
            limit={6}
          />
        </div>
      </div>

      {/* 5. Performance Insights Snapshot */}
      {insights.length > 0 && (
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[var(--accent)]" />
            <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-[var(--text)]">
              Performance Snapshot
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--border-subtle)] text-xs text-[var(--text)]/90 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                <span className="leading-relaxed">{ins}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
