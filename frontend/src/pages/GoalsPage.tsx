import React, { useState } from 'react';
import { Target, Plus, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { Goal } from '../types';

interface GoalsPageProps {
  goals: Goal[];
  onCreateClick: () => void;
  onDeleteGoal: (id: string) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  goals,
  onCreateClick,
  onDeleteGoal
}) => {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all');

  const filteredGoals = goals.filter(g => {
    if (filter === 'all') return true;
    return g.status === filter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#1a2333]/80">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Coding Goals</h2>
          <p className="text-xs sm:text-sm text-[#8b9cb4] mt-0.5">
            Set ambitious targets and track real mathematical progress from platform submissions.
          </p>
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all self-start sm:self-auto shadow-sm min-h-[44px] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Goal</span>
        </button>
      </div>

      {/* Filter Tabs - Horizontally scrollable without breaking on small viewports */}
      <div className="flex items-center gap-1 bg-[#101726] p-1 rounded-lg border border-[#1d263b] overflow-x-auto no-scrollbar touch-scroll max-w-full">
        {(['all', 'active', 'completed', 'expired'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded text-xs font-medium capitalize transition-colors shrink-0 min-h-[36px] active:scale-95 ${
              filter === tab
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-[#8b9cb4] hover:text-white hover:bg-[#162035]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredGoals.map(goal => (
            <div
              key={goal.id}
              className="bg-[#101726] border border-[#1d263b] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[#2a3754] transition-all space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Target className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <h3 className="font-semibold text-white text-sm line-clamp-2">{goal.title}</h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium shrink-0 uppercase border ${
                      goal.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : goal.status === 'expired'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {goal.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-[#8b9cb4] mb-3">
                  <span className="capitalize">{goal.goal_type.replace(/_/g, ' ')}</span>
                  <span>&bull;</span>
                  <span className="capitalize">{goal.platform || 'All Platforms'}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#8b9cb4]">
                      <span className="font-mono text-white font-bold">{goal.current || 0}</span> / {goal.target} {goal.goal_type === 'problems_solved' ? 'Problems' : ''}
                    </span>
                    <span className="font-mono font-bold text-white text-xs">
                      {goal.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#172238] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer with large touch target for delete */}
              <div className="flex items-center justify-between pt-3 border-t border-[#1c263c] text-xs text-[#64748b]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Due: {goal.end_date}</span>
                </div>

                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-[#64748b] hover:text-rose-400 transition-colors p-2 -mr-2 rounded-lg hover:bg-rose-500/10 min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-95"
                  title="Delete goal"
                  aria-label={`Delete goal ${goal.title}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#101726] border border-dashed border-[#1d263b] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <Target className="w-10 h-10 text-[#475569] mb-3" />
          <h4 className="text-sm font-semibold text-white">No goals found</h4>
          <p className="text-xs text-[#8b9cb4] mt-1 max-w-sm">
            {goals.length === 0
              ? 'Create your first goal to track target problems, active days, or contest ratings.'
              : `No ${filter} goals found.`}
          </p>
          <button
            onClick={onCreateClick}
            className="mt-4 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors min-h-[44px] flex items-center"
          >
            Create a Goal &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
