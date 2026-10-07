import React, { useMemo, useRef, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { HeatmapDay } from '../types';

interface ActivityHeatmapProps {
  activityData: HeatmapDay[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
  selectedDay?: string | null;
  onSelectDay?: (dateStr: string) => void;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activityData,
  selectedPlatform,
  onSelectPlatform,
  selectedDay,
  onSelectDay
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const platforms = [
    { id: 'all', label: 'All' },
    { id: 'leetcode', label: 'LeetCode' },
    { id: 'codechef', label: 'CodeChef' },
    { id: 'geeksforgeeks', label: 'GFG' },
    { id: 'codeforces', label: 'Codeforces' }
  ];

  // Auto-scroll to end (current date) on initial render for mobile
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [activityData]);

  // Format Date object to local YYYY-MM-DD (prevents timezone shifts from toISOString)
  const formatYYYYMMDD = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Build 52 weeks calendar grid (aligned Monday to Sunday, ending current week)
  const { weeks, monthLabels, todayStr } = useMemo(() => {
    const dataMap = new Map<string, HeatmapDay>();
    for (const d of activityData) {
      dataMap.set(d.date, d);
    }

    const today = new Date();
    const todayStr = formatYYYYMMDD(today);

    // Get Monday of current week
    const currentDay = today.getDay(); // 0 is Sunday, 1 is Monday...
    const daysSinceMonday = (currentDay + 6) % 7; // 0 for Mon, 6 for Sun

    // Start 51 weeks before current week's Monday
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysSinceMonday - (51 * 7));
    startDate.setHours(0, 0, 0, 0);

    const resultWeeks: { dateStr: string; dayData: HeatmapDay | null; isFuture: boolean; isToday: boolean }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);

    for (let w = 0; w < 52; w++) {
      const week: { dateStr: string; dayData: HeatmapDay | null; isFuture: boolean; isToday: boolean }[] = [];

      for (let d = 0; d < 7; d++) {
        const dateStr = formatYYYYMMDD(cursor);
        const isToday = dateStr === todayStr;
        const isFuture = dateStr > todayStr;
        const dayData = dataMap.get(dateStr) || null;

        if (cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth();
          const monthShort = cursor.toLocaleString('default', { month: 'short' });
          if (w < 50) {
            months.push({ label: monthShort, weekIndex: w });
          }
        }

        week.push({ dateStr, dayData, isFuture, isToday });
        cursor.setDate(cursor.getDate() + 1);
      }
      resultWeeks.push(week);
    }

    return { weeks: resultWeeks, monthLabels: months, todayStr };
  }, [activityData]);

  const getColorClass = (level: number, isToday: boolean) => {
    let colorStyle = '';
    switch (level) {
      case 1:
        colorStyle = 'bg-[var(--heatmap-1)] border-[#0E4429]';
        break;
      case 2:
        colorStyle = 'bg-[var(--heatmap-2)] border-[#006D32]';
        break;
      case 3:
        colorStyle = 'bg-[var(--heatmap-3)] border-[#26A641]';
        break;
      case 4:
        colorStyle = 'bg-[var(--heatmap-4)] border-[#39D353] shadow-[0_0_8px_rgba(57,211,83,0.5)]';
        break;
      default:
        colorStyle = 'bg-[var(--heatmap-0)] border-[var(--border)] hover:border-[var(--accent)]/80';
        break;
    }

    if (isToday) {
      return `${colorStyle} ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)] z-10`;
    }
    return colorStyle;
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">Activity Heatmap</h3>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)] self-start sm:self-auto overflow-x-auto no-scrollbar touch-scroll max-w-full">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-all whitespace-nowrap min-h-[28px] ${
                selectedPlatform === p.id
                  ? 'bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-sm'
                  : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-2 touch-scroll scroll-smooth"
      >
        <div className="min-w-[760px]">
          {/* Month Labels */}
          <div className="relative h-4 mb-1.5 ml-8 text-[10px] text-[var(--muted)] font-mono">
            {monthLabels.map((m, idx) => (
              <span
                key={idx}
                className="absolute whitespace-nowrap"
                style={{ left: `${m.weekIndex * 14}px` }}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Weekday Labels */}
            <div className="flex flex-col justify-between text-[10px] text-[var(--muted)] py-0.5 select-none w-6 shrink-0 h-[95px] font-mono">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>

            {/* Heatmap Grid */}
            <div className="flex gap-[3px] flex-1">
              {weeks.map((week, wIdx) => (
                <div key={wIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, dIdx) => {
                    if (day.isFuture) {
                      return (
                        <div
                          key={dIdx}
                          className="w-[11px] h-[11px] opacity-0 pointer-events-none"
                        />
                      );
                    }

                    const solved = day.dayData?.problems_solved || 0;
                    const subs = day.dayData?.submissions || 0;
                    const totalCount = day.dayData?.count || (solved > 0 ? solved : subs);

                    let level = day.dayData?.level || 0;
                    if (!level && totalCount > 0) {
                      if (totalCount >= 10) level = 4;
                      else if (totalCount >= 6) level = 3;
                      else if (totalCount >= 3) level = 2;
                      else if (totalCount >= 1) level = 1;
                    }

                    const isToday = day.isToday;
                    const isSelected = selectedDay === day.dateStr;
                    const titleText = totalCount > 0
                      ? `${formatTooltipDate(day.dateStr)}${isToday ? ' (Today)' : ''}: ${solved} solved, ${subs} submissions (Click to view)`
                      : `${formatTooltipDate(day.dateStr)}${isToday ? ' (Today)' : ''}: No activity recorded`;

                    return (
                      <div
                        key={dIdx}
                        onClick={() => onSelectDay?.(day.dateStr)}
                        title={titleText}
                        className={`w-[11px] h-[11px] rounded-[2px] border ${getColorClass(
                          level,
                          isToday
                        )} ${isSelected ? 'ring-2 ring-[var(--primary)] ring-offset-1 ring-offset-[var(--surface)] z-20 scale-125' : ''} transition-transform hover:scale-125 cursor-pointer`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-col 2xs:flex-row items-start 2xs:items-center justify-between gap-2 text-xs text-[var(--muted)] mt-3 pt-3 border-t border-[var(--border)]">
        <div className="flex items-center gap-1.5 text-[11px] text-[var(--accent)] font-mono">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] ring-2 ring-[var(--accent)]/50 inline-block shrink-0" />
          <span>Today ({todayStr}) highlighted with ring</span>
        </div>

        <div className="flex items-center gap-2 self-end 2xs:self-auto ml-auto">
          <span className="text-[10px] text-[var(--muted)] font-mono">Less</span>
          <div className="flex gap-1 items-center">
            <div title="No activity" className="w-2.5 h-2.5 rounded-[2px] bg-[var(--heatmap-0)] border border-[var(--border)]" />
            <div title="1-2 solved/subs" className="w-2.5 h-2.5 rounded-[2px] bg-[var(--heatmap-1)] border border-[#0E4429]" />
            <div title="3-5 solved/subs" className="w-2.5 h-2.5 rounded-[2px] bg-[var(--heatmap-2)] border border-[#006D32]" />
            <div title="6-9 solved/subs" className="w-2.5 h-2.5 rounded-[2px] bg-[var(--heatmap-3)] border border-[#26A641]" />
            <div title="10+ solved/subs" className="w-2.5 h-2.5 rounded-[2px] bg-[var(--heatmap-4)] border border-[#39D353]" />
          </div>
          <span className="text-[10px] text-[var(--muted)] font-mono">More</span>
        </div>
      </div>
    </div>
  );
};
