import React from 'react';
import {
  ListOrdered,
  Calendar,
  Flame,
  CloudUpload,
  Sparkles
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { PlatformCard } from '../components/PlatformCard';
import { ProblemsChart } from '../components/ProblemsChart';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { DifficultyChart } from '../components/DifficultyChart';
import { TopicList } from '../components/TopicList';
import { GoalsWidget } from '../components/GoalsWidget';
import { RecentActivityTable } from '../components/RecentActivityTable';
import {
  PlatformCardData,
  DashboardOverview,
  ChartPoint,
  HeatmapDay,
  DifficultyData,
  TopicData,
  RecentProblem,
  Goal,
  PlatformType
} from '../types';

interface DashboardPageProps {
  overview: DashboardOverview | null;
  platforms: PlatformCardData[];
  chartData: ChartPoint[];
  period: string;
  onPeriodChange: (period: string) => void;
  activityData: HeatmapDay[];
  selectedPlatform: string;
  onSelectPlatform: (p: string) => void;
  difficultyData: DifficultyData;
  topicsData: TopicData[];
  goals: Goal[];
  recentProblems: RecentProblem[];
  insights: string[];
  onConnectPlatform: (platform: PlatformType) => void;
  onManagePlatform: (platform: PlatformType) => void;
  onCreateGoal: () => void;
  onViewAllProblems: () => void;
  onViewAllGoals: () => void;
  onDeleteGoal: (id: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  overview,
  platforms,
  chartData,
  period,
  onPeriodChange,
  activityData,
  selectedPlatform,
  onSelectPlatform,
  difficultyData,
  topicsData,
  goals,
  recentProblems,
  insights,
  onConnectPlatform,
  onManagePlatform,
  onCreateGoal,
  onViewAllProblems,
  onViewAllGoals,
  onDeleteGoal
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
    if (hour < 12) return 'Good Morning 👋';
    if (hour < 17) return 'Good Afternoon 👋';
    return 'Good Evening 👋';
  };

  return (
    <div className="space-y-6">
      {/* 0. Greeting Banner */}
      <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-4 sm:p-5 flex flex-col min-[420px]:flex-row min-[420px]:items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-white tracking-tight">{getGreeting()}</h2>
          <p className="text-xs sm:text-sm text-[#8b9cb4] mt-0.5">Your verified coding progress overview</p>
        </div>
        {effectiveHasData && currentStreak !== null ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 self-start min-[420px]:self-auto font-mono text-xs font-semibold shrink-0 whitespace-nowrap">
            <Flame className="w-4 h-4 text-amber-500 shrink-0" />
            <span>{currentStreak} Day Streak</span>
          </div>
        ) : (
          <span className="text-xs text-[#64748b] shrink-0 whitespace-nowrap">Real-time telemetry</span>
        )}
      </div>

      {/* 1. Top Metrics Cards (4-col on desktop, 2-col on tablet, 1-col on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Problems"
          value={totalProblems}
          icon={ListOrdered}
          iconColor="text-blue-400"
          hasData={effectiveHasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Active Days"
          value={activeDays}
          icon={Calendar}
          iconColor="text-emerald-400"
          hasData={effectiveHasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Current Streak"
          value={effectiveHasData && currentStreak !== null && currentStreak !== undefined ? `${currentStreak} day${currentStreak === 1 ? '' : 's'}` : null}
          icon={Flame}
          iconColor="text-amber-500"
          hasData={effectiveHasData}
          badge={effectiveHasData && longestStreak ? `Max: ${longestStreak}d` : undefined}
          subtitle={effectiveHasData && longestStreak ? `Max streak: ${longestStreak} days` : 'Verified platform data'}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Total Submissions"
          value={totalSubmissions}
          icon={CloudUpload}
          iconColor="text-sky-400"
          hasData={effectiveHasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
      </div>

      {/* 2. Your Platforms Section */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-white tracking-tight">Your Platforms</h2>
            <span className="text-xs text-[#64748b]">
              {anyConnected ? 'Synced accounts' : 'Connect to track'}
            </span>
          </div>
        </div>

        {/* 4 Platform Cards (4-col on desktop, 2-col on tablet, 1-col on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platforms.map(p => (
            <PlatformCard
              key={p.platform}
              data={p}
              onConnect={onConnectPlatform}
              onManage={onManagePlatform}
            />
          ))}
        </div>
      </div>

      {/* 3. Main Dashboard Grid (Left 2 cols, Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Problems Solved Chart */}
          <ProblemsChart
            data={chartData}
            period={period}
            onPeriodChange={onPeriodChange}
            hasConnectedPlatforms={anyConnected}
            onConnectClick={() => onConnectPlatform('leetcode')}
          />

          {/* Coding Activity Heatmap */}
          <ActivityHeatmap
            activityData={activityData}
            selectedPlatform={selectedPlatform}
            onSelectPlatform={onSelectPlatform}
          />

          {/* Recent Activity Table */}
          <RecentActivityTable
            problems={recentProblems}
            onViewAllClick={onViewAllProblems}
            limit={5}
          />
        </div>

        {/* Right Column (Span 1) */}
        <div className="space-y-4 sm:space-y-6">
          {/* Goals Widget */}
          <GoalsWidget
            goals={goals}
            onCreateClick={onCreateGoal}
            onViewAllClick={onViewAllGoals}
            onDeleteGoal={onDeleteGoal}
            isCompact={true}
          />

          {/* Difficulty Donut Breakdown */}
          <DifficultyChart data={difficultyData} />

          {/* Problem Solving Topics */}
          <TopicList topics={topicsData} />
        </div>
      </div>

      {/* 4. Smart Insights (Factual observations derived from real data) */}
      {insights.length > 0 && (
        <div className="bg-[#101726] border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide uppercase">Smart Factual Insights</h4>
            <div className="mt-1 space-y-1">
              {insights.map((ins, i) => (
                <p key={i} className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
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
