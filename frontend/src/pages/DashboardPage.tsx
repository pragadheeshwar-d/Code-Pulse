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
  const hasData = overview?.has_data ?? false;
  const anyConnected = platforms.some(p => p.connected);

  return (
    <div className="space-y-6">
      {/* 1. Top Metrics Cards (4 cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Problems"
          value={overview?.total_problems ?? null}
          icon={ListOrdered}
          iconColor="text-blue-400"
          hasData={hasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Active Days"
          value={overview?.active_days ?? null}
          icon={Calendar}
          iconColor="text-emerald-400"
          hasData={hasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Current Streak"
          value={hasData && overview?.current_streak !== null && overview?.current_streak !== undefined ? `${overview.current_streak} days` : null}
          icon={Flame}
          iconColor="text-amber-500"
          hasData={hasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
        <MetricCard
          title="Total Submissions"
          value={overview?.total_submissions ?? null}
          icon={CloudUpload}
          iconColor="text-sky-400"
          hasData={hasData}
          onConnectClick={() => onConnectPlatform('leetcode')}
        />
      </div>

      {/* 2. Your Platforms Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-base font-semibold text-white">Your Platforms</h2>
          <span className="text-xs text-[#64748b]">
            {anyConnected ? 'Synced accounts' : 'Connect your accounts to start tracking'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="lg:col-span-2 space-y-6">
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
        <div className="space-y-6">
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
                  <span className="w-1 h-1 rounded-full bg-blue-400" />
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
