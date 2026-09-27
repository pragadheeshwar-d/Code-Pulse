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

  // Build 52 weeks calendar grid (364 days ending today)
  const { weeks, monthLabels } = useMemo(() => {
    const dataMap = new Map<string, HeatmapDay>();
    for (const d of activityData) {
      dataMap.set(d.date, d);
    }

    const today = new Date();
    const resultWeeks: { dateStr: string; dayData: HeatmapDay | null; dayOfWeek: number }[][] = [];
    const months: { label: string; weekIndex: number }[] = [];

    // Align to Sunday/Monday
    const totalDays = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - totalDays + 1);

    let currentWeek: { dateStr: string; dayData: HeatmapDay | null; dayOfWeek: number }[] = [];
    let lastMonth = -1;

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayData = dataMap.get(dateStr) || null;
      const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday...

      if (d.getMonth() !== lastMonth && currentWeek.length === 0) {
        lastMonth = d.getMonth();
        const monthShort = d.toLocaleString('default', { month: 'short' });
        months.push({ label: monthShort, weekIndex: resultWeeks.length });
      }

      currentWeek.push({ dateStr, dayData, dayOfWeek });

      if (currentWeek.length === 7) {
        resultWeeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      resultWeeks.push(currentWeek);
    }

    return { weeks: resultWeeks, monthLabels: months };
  }, [activityData]);

  const getColorClass = (level: number) => {
    switch (level) {
      case 1:
        return 'bg-blue-900 border-blue-800';
      case 2:
        return 'bg-blue-700 border-blue-600';
      case 3:
        return 'bg-blue-500 border-blue-400';
      case 4:
        return 'bg-blue-400 border-blue-300';
      default:
        return 'bg-[#141d2f] border-[#1d2942]';
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
        <div className="min-w-[620px]">
          {/* Month Labels */}
          <div className="flex text-[10px] text-[#64748b] mb-1 pl-8 gap-[11px]">
            {monthLabels.map((m, idx) => (
              <span key={idx} className="w-8 text-left">
                {m.label}
              </span>
            ))}
          </div>

          <div className="flex gap-2">
            {/* Weekday Labels */}
            <div className="flex flex-col justify-between text-[10px] text-[#64748b] py-0.5 select-none w-6 shrink-0">
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
                    const level = day.dayData?.level || 0;
                    const solved = day.dayData?.problems_solved || 0;
                    const subs = day.dayData?.submissions || 0;
                    const titleText = `${day.dateStr}: ${solved} problems solved, ${subs} submissions`;

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
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-900 border border-blue-800" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-700 border border-blue-600" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-500 border border-blue-400" />
          <div className="w-2.5 h-2.5 rounded-[2px] bg-blue-400 border border-blue-300" />
        </div>
        <span>More activity</span>
      </div>
    </div>
  );
};
