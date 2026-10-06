import React from 'react';
import { Sparkles } from 'lucide-react';
import { ProblemsChart } from '../components/ProblemsChart';
import { DifficultyChart } from '../components/DifficultyChart';
import { TopicList } from '../components/TopicList';
import { ChartPoint, DifficultyData, TopicData } from '../types';

interface AnalyticsPageProps {
  chartData: ChartPoint[];
  period: string;
  onPeriodChange: (p: string) => void;
  difficultyData: DifficultyData;
  topicsData: TopicData[];
  insights: string[];
  anyConnected: boolean;
  onConnectClick: () => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  chartData,
  period,
  onPeriodChange,
  difficultyData,
  topicsData,
  insights,
  anyConnected,
  onConnectClick
}) => {
  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Main Trends Chart */}
      <ProblemsChart
        data={chartData}
        period={period}
        onPeriodChange={onPeriodChange}
        hasConnectedPlatforms={anyConnected}
        onConnectClick={onConnectClick}
      />

      {/* Grid: Difficulty + Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        <DifficultyChart data={difficultyData} />
        <TopicList topics={topicsData} />
      </div>

      {/* Analytical Observations */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">Telemetry Observations</h3>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)]/90 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-1 shrink-0" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)] py-3 font-mono">
            Insufficient historical telemetry points collected yet. Link platforms and sync to track progress over time.
          </p>
        )}
      </div>
    </div>
  );
};

