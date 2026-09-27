import React from 'react';
import { Target, Plus, CheckCircle, Clock } from 'lucide-react';
import { Goal } from '../types';

interface GoalsWidgetProps {
  goals: Goal[];
  onCreateClick: () => void;
  onViewAllClick?: () => void;
  onDeleteGoal?: (id: string) => void;
  isCompact?: boolean;
}

export const GoalsWidget: React.FC<GoalsWidgetProps> = ({
  goals,
  onCreateClick,
  onViewAllClick,
  onDeleteGoal,
  isCompact = false
}) => {
  const hasGoals = goals.length > 0;
  const displayedGoals = isCompact ? goals.slice(0, 3) : goals;

  return (
    <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Goals</h3>
        </div>

        <div className="flex items-center gap-2">
          {hasGoals && onViewAllClick && (
            <button
              onClick={onViewAllClick}
              className="text-xs text-[#8b9cb4] hover:text-white transition-colors"
            >
              View all &rarr;
            </button>
          )}
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Create Goal</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {hasGoals ? (
        <div className="space-y-3">
          {displayedGoals.map(goal => (
            <div
              key={goal.id}
              className="p-3 bg-[#162035] border border-[#212f4d] rounded-lg space-y-2 hover:border-[#2d3f66] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-white line-clamp-1">{goal.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    goal.status === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : goal.status === 'expired'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[#8b9cb4]">
                  <span>
                    {goal.current || 0} / {goal.target}
                  </span>
                  <span className="font-mono text-white font-medium">
                    {goal.progress_percentage || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#0f1726] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      goal.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${goal.progress_percentage || 0}%` }}
                  />
                </div>
              </div>

              {/* Dates & Delete */}
              <div className="flex items-center justify-between text-[10px] text-[#64748b] pt-1">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>Ends {goal.end_date}</span>
                </div>
                {onDeleteGoal && (
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="hover:text-rose-400 transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Clean Empty State matching screenshot */
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 border border-dashed border-[#1d263b] rounded-lg">
          <div className="w-10 h-10 rounded-full bg-[#162035] border border-[#212f4d] flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-[#64748b]" />
          </div>
          <h4 className="text-xs font-semibold text-white">No goals yet</h4>
          <p className="text-[11px] text-[#64748b] mt-1 max-w-[200px]">
            Set your first goal and turn your coding dreams into progress.
          </p>
          <button
            onClick={onCreateClick}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Create your first coding goal &rarr;
          </button>
        </div>
      )}
    </div>
  );
};
