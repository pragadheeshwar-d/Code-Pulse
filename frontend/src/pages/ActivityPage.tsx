import React, { useState } from 'react';
import { Calendar, Flame, CheckCircle2, ExternalLink } from 'lucide-react';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { HeatmapDay, DashboardOverview, RecentProblem } from '../types';

interface ActivityPageProps {
  activityData: HeatmapDay[];
  selectedPlatform: string;
  onSelectPlatform: (p: string) => void;
  overview: DashboardOverview | null;
  onConnectClick: () => void;
  recentProblems?: RecentProblem[];
}

export const ActivityPage: React.FC<ActivityPageProps> = ({
  activityData,
  selectedPlatform,
  onSelectPlatform,
  overview,
  recentProblems = []
}) => {
  const activeDaysList = activityData.filter(d => d.count > 0).sort((a, b) => b.date.localeCompare(a.date));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const selectedDayData = activityData.find(d => d.date === selectedDate) || null;

  // Filter problems solved on the selected date
  const selectedDayProblems = recentProblems.filter(p => {
    if (!selectedDate) return false;
    const pDate = p.date ? p.date.split('T')[0] : '';
    return pDate === selectedDate;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Header */}
      <div className="pb-3 border-b border-[var(--border)]">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
          Activity Timeline
        </h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Daily problem solves, submission volume, and platform activity history
        </p>
      </div>

      {/* 2. Top Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-muted)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">
              Active Days
            </span>
            <p className="text-lg font-bold text-[var(--text)] font-mono mt-0.5">
              {overview?.active_days ?? 0}
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--warm-muted)] border border-[var(--warm)]/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[var(--warm)]" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">
              Current Streak
            </span>
            <p className="text-lg font-bold text-[var(--warm)] font-mono mt-0.5">
              {overview?.current_streak ?? 0} days
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[var(--warm-muted)] border border-[var(--warm)]/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-[var(--warm)]" />
          </div>
          <div>
            <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">
              Max Streak
            </span>
            <p className="text-lg font-bold text-[var(--warm)] font-mono mt-0.5">
              {overview?.longest_streak ?? 0} days
            </p>
          </div>
        </div>
      </div>

      {/* 3. Heatmap Component with cell click support */}
      <ActivityHeatmap
        activityData={activityData}
        selectedPlatform={selectedPlatform}
        onSelectPlatform={onSelectPlatform}
        selectedDay={selectedDate}
        onSelectDay={d => setSelectedDate(prev => prev === d ? null : d)}
      />

      {/* 4. Selected Day Detail View (Phase 10 requirement) */}
      {selectedDayData && (
        <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono font-bold text-sm text-[var(--text)]">
                {selectedDayData.date}
              </span>
              <span className="text-xs text-[var(--accent)] font-mono font-semibold">
                {selectedDayData.problems_solved} solved · {selectedDayData.submissions} submissions
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {selectedDayData.platforms.map((p, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-semibold bg-[var(--surface-active)] text-[var(--text)] border border-[var(--border)]"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {selectedDayProblems.length > 0 ? (
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wider block">
                Solved on this date:
              </span>
              <div className="divide-y divide-[var(--border-subtle)]">
                {selectedDayProblems.map((prob, idx) => (
                  <div key={idx} className="py-1.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                      <span className="text-[var(--text)] font-medium truncate">{prob.title}</span>
                      <span className="text-[10px] text-[var(--muted)] font-mono capitalize">
                        ({prob.platform})
                      </span>
                    </div>
                    {prob.url && (
                      <a
                        href={prob.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-[var(--accent)] hover:underline flex items-center gap-1 shrink-0 ml-2"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] font-mono py-1">
              {selectedDayData.problems_solved > 0
                ? `${selectedDayData.problems_solved} problem solves and ${selectedDayData.submissions} submissions recorded on this date across ${selectedDayData.platforms.join(', ')}.`
                : 'No problems solved on this date.'}
            </p>
          )}
        </div>
      )}

      {/* 5. Chronological Day-by-Day Activity Log */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--text)] mb-3">
          Daily Activity Log
        </h3>

        {activeDaysList.length > 0 ? (
          <div className="divide-y divide-[var(--border-subtle)] max-h-80 overflow-y-auto pr-1 touch-scroll font-mono text-xs">
            {activeDaysList.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedDate(prev => prev === day.date ? null : day.date)}
                className={`w-full py-2.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left rounded-md transition-colors ${
                  selectedDate === day.date
                    ? 'bg-[var(--surface-hover)] border border-[var(--border)]'
                    : 'hover:bg-[var(--surface-hover)]'
                }`}
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <span className="text-[var(--text)] font-medium">{day.date}</span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {day.platforms.map((p, pIdx) => (
                      <span
                        key={pIdx}
                        className="px-1.5 py-0.2 rounded text-[10px] bg-[var(--bg)] text-[var(--muted)] border border-[var(--border)] capitalize"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[var(--muted)] text-[11px]">
                  <span>
                    <strong className="text-[var(--text)]">{day.problems_solved}</strong> solved
                  </span>
                  <span>•</span>
                  <span>
                    <strong className="text-[var(--text)]">{day.submissions}</strong> submissions
                  </span>
                </div>
              </button>
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
