import React from 'react';
import { Target, Plus, Clock } from 'lucide-react';
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
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[var(--warm)]/10 text-[var(--warm)] border border-[var(--warm)]/20 flex items-center justify-center shrink-0">
            <Target className="w-3.5 h-3.5 text-[var(--warm)]" />
          </div>
          <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">Active Goals</h3>
        </div>

        <div className="flex items-center gap-2">
          {hasGoals && onViewAllClick && (
            <button
              onClick={onViewAllClick}
              className="text-xs text-[var(--accent)] hover:underline font-medium transition-colors"
            >
              View all →
            </button>
          )}
          <button
            onClick={onCreateClick}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] transition-all active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Body */}
      {hasGoals ? (
        <div className="space-y-3">
          {displayedGoals.map(goal => (
            <div
              key={goal.id}
              className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg space-y-2 hover:border-[var(--border)] transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-[var(--text)] line-clamp-1">{goal.title}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 uppercase tracking-wider border ${
                    goal.status === 'completed'
                      ? 'bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/20'
                      : goal.status === 'expired'
                      ? 'bg-[var(--danger)]/10 text-[var(--danger)] border-[var(--danger)]/20'
                      : 'bg-[var(--warm)]/10 text-[var(--warm)] border-[var(--warm)]/20'
                  }`}
                >
                  {goal.status}
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-[var(--muted)]">
                  <span>
                    <strong className="text-[var(--text)] font-mono">{goal.current || 0}</strong> / {goal.target}
                  </span>
                  <span className="font-mono text-[var(--warm)] font-semibold">
                    {goal.progress_percentage || 0}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[var(--warm)] rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                  />
                </div>
              </div>

              {/* Dates & Delete */}
              <div className="flex items-center justify-between text-[10px] text-[var(--muted)] pt-0.5 font-mono">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[var(--muted)]" />
                  <span>Ends {goal.end_date}</span>
                </div>
                {onDeleteGoal && (
                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    className="hover:text-[var(--danger)] transition-colors"
                    aria-label={`Delete ${goal.title}`}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-6 px-4 border border-dashed border-[var(--border)] rounded-lg bg-[var(--bg)]/50">
          <div className="w-9 h-9 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-2">
            <Target className="w-4 h-4 text-[var(--warm)]" />
          </div>
          <h4 className="text-xs font-semibold text-[var(--text)]">No active goals</h4>
          <p className="text-[11px] text-[var(--muted)] mt-1 max-w-[200px]">
            Set target deadlines to accelerate your problem-solving momentum.
          </p>
          <button
            onClick={onCreateClick}
            className="mt-2.5 text-xs text-[var(--accent)] hover:underline font-semibold transition-colors flex items-center"
          >
            Create a milestone goal →
          </button>
        </div>
      )}
    </div>
  );
};
