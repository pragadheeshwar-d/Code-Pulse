import React, { useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { HeatmapDay } from '../types';

interface ActivityHeatmapProps {
  activityData: HeatmapDay[];
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  activityData,
  selectedPlatform,
  onSelectPlatform
}) => {
  const platforms = [
    { id: 'all', label: 'All' },
    { id: 'leetcode', label: 'LeetCode' },
    { id: 'codechef', label: 'CodeChef' },
    { id: 'geeksforgeeks', label: 'GFG' },
    { id: 'codeforces', label: 'Codeforces' }
  ];

  // Build 52 weeks calendar grid (aligned Monday to Sunday, ending current week)
  const { weeks, monthLabels } = useMemo(() => {
    const dataMap = new Map<string, HeatmapDay>();
    for (const d of activityData) {
      dataMap.set(d.date, d);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Monday is day 1, Sunday is day 0 in JS getDay()
    const currentDay = today.getDay();
    const daysSinceMonday = (currentDay + 6) % 7; // 0 for Mon, 6 for Sun

    // Start on Monday 51 weeks ago (52 weeks total)
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysSinceMonday - (51 * 7));
    startDate.setHours(0, 0, 0, 0);

    const resultWeeks: { dateStr: string; dayData: HeatmapDay | null; isFuture: boolean }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    const cursor = new Date(startDate);

    for (let w = 0; w < 52; w++) {
      const week: { dateStr: string; dayData: HeatmapDay | null; isFuture: boolean }[] = [];

      for (let d = 0; d < 7; d++) {
        const dateStr = cursor.toISOString().split('T')[0];
        const isFuture = cursor > today;
        const dayData = dataMap.get(dateStr) || null;

        if (cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth();
          const monthShort = cursor.toLocaleString('default', { month: 'short' });
          if (w < 50) {
            months.push({ label: monthShort, weekIndex: w });
          }
        }

        week.push({ dateStr, dayData, isFuture });
        cursor.setDate(cursor.getDate() + 1);
      }
      resultWeeks.push(week);
    }

    return { weeks: resultWeeks, monthLabels: months };
  }, [activityData]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-blue-900/90 border-blue-700/60';
      case 2:
        return 'bg-blue-700 border-blue-500';
      case 3:
        return 'bg-blue-500 border-blue-400';
      case 4:
        return 'bg-blue-400 border-blue-300';
      default:
        return 'bg-[#141d2f] border-[#1d2942]';
    }
  };

  const formatTooltipDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr + 'T00:00:00Z');
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Coding Activity</h3>
        </div>

        {/* Platform Tabs */}
        <div className="flex items-center gap-1 bg-[#162035] p-1 rounded-lg border border-[#22314d] self-start sm:self-auto overflow-x-auto max-w-full">
          {platforms.map(p => (
            <button
              key={p.id}
              onClick={() => onSelectPlatform(p.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                selectedPlatform === p.id
                  ? 'bg-blue-600 text-white font-semibold shadow-sm'
                  : 'text-[#8b9cb4] hover:text-white hover:bg-[#1f2d48]'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[760px]">
          {/* Month Labels Positioned Accurately Above Columns */}
          <div className="relative h-4 mb-1.5 ml-8 text-[10px] text-[#64748b]">
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
            {/* Weekday Labels (Mon, Wed, Fri, Sun mapped to rows 0, 2, 4, 6) */}
            <div className="flex flex-col justify-between text-[10px] text-[#64748b] py-0.5 select-none w-6 shrink-0 h-[95px]">
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

                    const titleText = totalCount > 0
                      ? `${formatTooltipDate(day.dateStr)}: ${solved} solved, ${subs} submissions`
                      : `${formatTooltipDate(day.dateStr)}: No activity recorded`;

                    return (
                      <div
                        key={dIdx}
                        title={titleText}
                        className={`w-[11px] h-[11px] rounded-[2px] border ${getColorClass(
                          level
                        )} transition-transform hover:scale-125 cursor-pointer`}
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
      <div className="flex items-center justify-end gap-2 text-xs text-[#64748b] mt-3 pt-3 border-t border-[#1a2333]/80">
        <span>Less activity</span>
        <div className="flex gap-1 items-center">
          <div className="w-2.5 h-2.5 rounded-[2px] bg-[#141d2f] border border-[#1d2942]" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-900/90 border border-blue-700/60" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-700 border border-blue-500" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-500 border border-blue-400" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-400 border border-blue-300" />
        </div>
        <span>More activity</span>
      </div>
    </div>
  );
};
