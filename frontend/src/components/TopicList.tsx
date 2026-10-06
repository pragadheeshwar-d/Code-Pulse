import React from 'react';
import { Layers } from 'lucide-react';
import { TopicData } from '../types';

interface TopicListProps {
  topics: TopicData[];
}

export const TopicList: React.FC<TopicListProps> = ({ topics }) => {
  // Sort topics by count descending
  const sortedTopics = [...topics].sort((a, b) => b.count - a.count);
  const displayTopics = sortedTopics.length > 0 ? sortedTopics.slice(0, 10) : [
    { name: 'Arrays', count: 0, percentage: 0 },
    { name: 'Strings', count: 0, percentage: 0 },
    { name: 'Sorting', count: 0, percentage: 0 },
    { name: 'Binary Search', count: 0, percentage: 0 },
    { name: 'Hashing', count: 0, percentage: 0 },
    { name: 'Two Pointers', count: 0, percentage: 0 },
    { name: 'Math', count: 0, percentage: 0 },
    { name: 'Greedy', count: 0, percentage: 0 },
    { name: 'Dynamic Programming', count: 0, percentage: 0 },
    { name: 'Linked Lists', count: 0, percentage: 0 }
  ];

  const hasData = topics.some(t => t.count > 0);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
            <Layers className="w-3.5 h-3.5 text-[var(--accent)]" />
          </div>
          <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">DSA & Topic Coverage</h3>
        </div>
        {hasData && (
          <span className="text-[10px] font-mono text-[var(--muted)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--border)]">
            Top Practiced
          </span>
        )}
      </div>

      {/* Topics List */}
      <div className="space-y-2.5">
        {displayTopics.map((topic, idx) => (
          <div key={idx} className="flex items-center justify-between gap-2.5 text-xs">
            <span className="text-[var(--text)]/90 w-24 sm:w-32 truncate font-medium">{topic.name}</span>

            {/* Progress track */}
            <div className="flex-1 h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
              <div
                className="h-full bg-[var(--accent)] rounded-full transition-all duration-500"
                style={{ width: `${hasData ? Math.min(100, Math.max(topic.percentage, 4)) : 0}%` }}
              />
            </div>

            {/* Count & Percentage */}
            <div className="font-mono text-[var(--muted)] w-16 sm:w-20 text-right shrink-0">
              {hasData ? (
                <span>
                  <span className="text-[var(--text)] font-semibold">{topic.count}</span>
                  <span className="text-[10px] text-[var(--muted)] ml-1">({topic.percentage}%)</span>
                </span>
              ) : (
                '—%'
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
