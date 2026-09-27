import React from 'react';
import { Layers } from 'lucide-react';
import { TopicData } from '../types';

interface TopicListProps {
  topics: TopicData[];
}

export const TopicList: React.FC<TopicListProps> = ({ topics }) => {
  const displayTopics = topics.length > 0 ? topics.slice(0, 9) : [
    { name: 'Arrays', count: 0, percentage: 0 },
    { name: 'Strings', count: 0, percentage: 0 },
    { name: 'Hashing', count: 0, percentage: 0 },
    { name: 'Two Pointers', count: 0, percentage: 0 },
    { name: 'Sliding Window', count: 0, percentage: 0 },
    { name: 'Binary Search', count: 0, percentage: 0 },
    { name: 'Trees', count: 0, percentage: 0 },
    { name: 'Graphs', count: 0, percentage: 0 },
    { name: 'Dynamic Programming', count: 0, percentage: 0 }
  ];

  const hasData = topics.some(t => t.count > 0);

  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-blue-400" />
        <h3 className="font-semibold text-white text-sm">Problem Solving Topics</h3>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {displayTopics.map((topic, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-xs">
            <span className="text-[#8b9cb4] w-28 truncate">{topic.name}</span>

            {/* Progress track */}
            <div className="flex-1 h-1.5 bg-[#172238] rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${hasData ? topic.percentage : 0}%` }}
              />
            </div>

            {/* Percentage */}
            <span className="font-mono text-[#8b9cb4] w-9 text-right">
              {hasData ? `${topic.percentage}%` : '—%'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
