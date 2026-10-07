import React, { useState } from 'react';
import { Target, Plus, Trash2, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
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

  const getDaysRemaining = (endDateStr: string) => {
    try {
      const now = new Date();
      const end = new Date(endDateStr);
      const diffMs = end.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays < 0) return 'Expired';
      if (diffDays === 0) return 'Due today';
      if (diffDays === 1) return '1 day remaining';
      return `${diffDays} days remaining`;
    } catch {
      return '';
    }
  };

  const getGoalSubtitle = (goal: Goal) => {
    const remaining = Math.max(0, goal.target - (goal.current || 0));
    if (goal.status === 'completed') {
      return 'Target completed successfully';
    }
    if (goal.goal_type === 'contest_rating') {
      return `${remaining} rating points needed`;
    }
    if (goal.goal_type === 'contest_count') {
      return `${remaining} contest participations needed`;
    }
    if (goal.goal_type === 'active_days') {
      return `${remaining} active days needed`;
    }
    return `${remaining} problems remaining`;
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
              Goals & Milestones
            </h2>
            <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]">
              {goals.filter(g => g.status === 'active').length} active
            </span>
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            Define daily problem counts, platform rating targets, and contest participations
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Filter tabs */}
          <div className="flex items-center gap-1 bg-[var(--surface)] p-0.5 rounded-lg border border-[var(--border)] text-xs">
            {(['all', 'active', 'completed', 'expired'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-2.5 py-1 rounded text-xs capitalize transition-colors font-medium ${
                  filter === tab
                    ? 'bg-[var(--surface-active)] text-[var(--text)] font-semibold border border-[var(--border)]'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <button
            onClick={onCreateClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] text-[var(--on-primary)] font-semibold rounded-lg text-xs hover:opacity-90 transition min-h-[32px] shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* 2. Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredGoals.map(goal => {
            const isCompleted = goal.status === 'completed';
            const isExpired = goal.status === 'expired' || goal.status === 'failed';
            const progress = Math.min(goal.progress_percentage || 0, 100);
            const daysText = getDaysRemaining(goal.end_date);

            return (
              <div
                key={goal.id}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col justify-between hover:border-[var(--border-subtle)] transition-colors space-y-3.5"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 border ${
                          isCompleted
                            ? 'bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/20'
                            : isExpired
                            ? 'bg-[var(--danger-muted)] text-[var(--danger)] border-[var(--danger)]/20'
                            : 'bg-[var(--warm-muted)] text-[var(--warm)] border-[var(--warm)]/20'
                        }`}
                      >
                        <Target className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="font-semibold text-xs sm:text-sm text-[var(--text)] truncate font-sans">
                        {goal.title}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold shrink-0 border ${
                        isCompleted
                          ? 'bg-[var(--accent-muted)] text-[var(--accent)] border-[var(--accent)]/20'
                          : isExpired
                          ? 'bg-[var(--danger-muted)] text-[var(--danger)] border-[var(--danger)]/20'
                          : 'bg-[var(--warm-muted)] text-[var(--warm)] border-[var(--warm)]/20'
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono mb-3">
                    <span className="capitalize">{goal.goal_type.replace(/_/g, ' ')}</span>
                    <span>•</span>
                    <span className="capitalize">{goal.platform || 'All platforms'}</span>
                  </div>

                  {/* Progress Bar & Numerical stats */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--text)] font-mono font-medium">
                        {goal.current || 0} / {goal.target}
                      </span>
                      <span className="font-mono font-semibold text-[var(--accent)] text-xs">
                        {progress}%
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted ? 'bg-[var(--accent)]' : isExpired ? 'bg-[var(--danger)]' : 'bg-[var(--warm)]'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[var(--muted)] pt-0.5">
                      {getGoalSubtitle(goal)}
                    </p>
                  </div>
                </div>

                {/* Footer with deadline and delete action */}
                <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--muted)]">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-[var(--muted)]" />
                    <span>{daysText}</span>
                  </div>

                  <button
                    onClick={() => onDeleteGoal(goal.id)}
                    title="Delete goal"
                    className="p-1 rounded text-[var(--muted)] hover:text-[var(--danger)] hover:bg-[var(--bg)] transition"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">No goals found</p>
          <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
            {filter !== 'all'
              ? `There are no ${filter} goals at this time.`
              : 'Create your first goal to set problem-solving quotas, contest counts, or rating milestones.'}
          </p>
          <button
            onClick={onCreateClick}
            className="mt-2 px-3 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:opacity-90 transition"
          >
            Create goal
          </button>
        </div>
      )}
    </div>
  );
};
