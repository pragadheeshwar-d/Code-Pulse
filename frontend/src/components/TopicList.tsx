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
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">DSA & Topic Coverage</h3>
        </div>
        {hasData && (
          <span className="text-[10px] text-[#64748b] bg-[#162035] px-2 py-0.5 rounded border border-[#22314d]">
            Top Practiced
          </span>
        )}
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {displayTopics.map((topic, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-[#8b9cb4] w-32 truncate">{topic.name}</span>

            {/* Progress track */}
            <div className="flex-1 h-1.5 bg-[#172238] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${hasData ? Math.min(100, Math.max(topic.percentage, 4)) : 0}%` }}
              />
            </div>

            {/* Count & Percentage */}
            <div className="font-mono text-[#8b9cb4] w-20 text-right shrink-0">
              {hasData ? (
                <span>
                  <span className="text-white font-medium">{topic.count}</span>
                  <span className="text-[10px] text-[#64748b] ml-1">({topic.percentage}%)</span>
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
