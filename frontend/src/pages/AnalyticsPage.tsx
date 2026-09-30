import React from 'react';
import { BarChart3, TrendingUp, Sparkles, PieChart as PieIcon, Layers } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1a2333]/80">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Progress Analytics</h2>
        <p className="text-xs sm:text-sm text-[#8b9cb4] mt-0.5">
          Mathematical metrics, growth curves, and skill distributions derived from your coding history.
        </p>
      </div>

      {/* Main Trends Chart */}
      <ProblemsChart
        data={chartData}
        period={period}
        onPeriodChange={onPeriodChange}
        hasConnectedPlatforms={anyConnected}
        onConnectClick={onConnectClick}
      />

      {/* Grid: Difficulty + Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <DifficultyChart data={difficultyData} />
        <TopicList topics={topicsData} />
      </div>

      {/* Smart Factual Insights */}
      <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <h3 className="font-semibold text-white text-sm">Factual Analytical Observations</h3>
        </div>

        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {insights.map((ins, i) => (
              <div
                key={i}
                className="p-3 bg-[#162035] border border-[#212f4d] rounded-lg text-xs text-[#cbd5e1] flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                <span>{ins}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#64748b] py-3">
            Not enough historical data collected yet to produce factual comparisons. Connect platforms and sync to track progress over time.
          </p>
        )}
      </div>
    </div>
  );
};
