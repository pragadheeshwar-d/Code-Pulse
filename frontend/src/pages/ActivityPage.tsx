import React from 'react';
import { Calendar, Flame, CheckCircle, Clock } from 'lucide-react';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { HeatmapDay, DashboardOverview } from '../types';

interface ActivityPageProps {
  activityData: HeatmapDay[];
  selectedPlatform: string;
  onSelectPlatform: (p: string) => void;
  overview: DashboardOverview | null;
  onConnectClick: () => void;
}

export const ActivityPage: React.FC<ActivityPageProps> = ({
  activityData,
  selectedPlatform,
  onSelectPlatform,
  overview,
  onConnectClick
}) => {
  const activeDaysList = activityData.filter(d => d.count > 0).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1a2333]/80">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Coding Activity Log</h2>
        <p className="text-xs sm:text-sm text-[#8b9cb4] mt-0.5">
          Real-time daily activity heatmap and chronological submission calendar.
        </p>
      </div>

      {/* Top summary cards */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-3.5 sm:p-4 bg-[#101726] border border-[#1d263b] rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <span className="text-xs text-[#8b9cb4]">Active Days</span>
            <p className="text-lg sm:text-xl font-bold text-white font-mono">{overview?.active_days ?? 0}</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-[#101726] border border-[#1d263b] rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <span className="text-xs text-[#8b9cb4]">Current Streak</span>
            <p className="text-lg sm:text-xl font-bold text-white font-mono">{overview?.current_streak ?? 0} days</p>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 bg-[#101726] border border-[#1d263b] rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <span className="text-xs text-[#8b9cb4]">Longest Streak</span>
            <p className="text-lg sm:text-xl font-bold text-white font-mono">{overview?.longest_streak ?? 0} days</p>
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <ActivityHeatmap
        activityData={activityData}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={onSelectPlatform}
      />

      {/* Day by Day Log Table */}
      <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-4 sm:p-5">
        <h3 className="font-semibold text-white text-sm mb-4">Daily Activity Timeline</h3>

        {activeDaysList.length > 0 ? (
          <div className="divide-y divide-[#172238] max-h-96 overflow-y-auto pr-1">
            {activeDaysList.map((day, idx) => (
              <div key={idx} className="py-3 flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-mono text-white font-medium">{day.date}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {day.platforms.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[#162035] text-[#8b9cb4] border border-[#212f4d] capitalize font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[#8b9cb4] font-mono text-[11px] sm:text-xs">
                  <span>
                    <strong className="text-white">{day.problems_solved}</strong> solved
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-white">{day.submissions}</strong> subs
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#64748b] py-6 text-center">
            No coding activity recorded for this period. Connect a platform to start tracking.
          </p>
        )}
      </div>
    </div>
  );
};
