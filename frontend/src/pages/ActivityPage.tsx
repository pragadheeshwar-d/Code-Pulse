import React from 'react';
import { Calendar, Flame } from 'lucide-react';
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
  overview
}) => {
  const activeDaysList = activityData.filter(d => d.count > 0).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Top summary cards */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">Active Days</span>
            <p className="text-lg font-bold text-[var(--text)] font-mono mt-0.5">{overview?.active_days ?? 0}</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[var(--warm)]/10 border border-[var(--warm)]/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[var(--warm)]" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">Current Streak</span>
            <p className="text-lg font-bold text-[var(--warm)] font-mono mt-0.5">{overview?.current_streak ?? 0} days</p>
          </div>
        </div>

        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-[var(--warm)]/10 border border-[var(--warm)]/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[var(--warm)]" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">Max Streak</span>
            <p className="text-lg font-bold text-[var(--warm)] font-mono mt-0.5">{overview?.longest_streak ?? 0} days</p>
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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
        <h3 className="font-semibold text-[var(--text)] text-sm mb-4 font-sans tracking-tight">Daily Activity Timeline</h3>

        {activeDaysList.length > 0 ? (
          <div className="divide-y divide-[var(--border)] max-h-96 overflow-y-auto pr-1">
            {activeDaysList.map((day, idx) => (
              <div key={idx} className="py-2.5 flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                  <span className="font-mono text-[var(--text)] font-medium">{day.date}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {day.platforms.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-1.5 py-0.5 rounded text-[10px] bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)] capitalize font-mono font-medium"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[var(--muted)] font-mono text-[11px]">
                  <span>
                    <strong className="text-[var(--text)] font-semibold">{day.problems_solved}</strong> solved
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-[var(--text)] font-semibold">{day.submissions}</strong> subs
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[var(--muted)] py-6 text-center font-mono">
            No active submissions recorded for this timeframe. Connect a platform to start tracking.
          </p>
        )}
      </div>
    </div>
  );
};

