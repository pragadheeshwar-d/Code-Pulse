import React, { useState } from 'react';
import { Target, Plus, Clock, Trash2 } from 'lucide-react';
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
    <div className="space-y-4 sm:space-y-5">
      {/* Action Bar */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] overflow-x-auto no-scrollbar touch-scroll">
        {(['all', 'active', 'completed', 'expired'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1 rounded text-xs font-semibold capitalize transition-all shrink-0 min-h-[30px] ${
              filter === tab
                ? 'bg-[var(--primary)] text-[var(--on-primary)] shadow-sm font-bold'
                : 'text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]'
            }`}
          >
            {tab}
          </button>
        ))}
        </div>

        <button
          onClick={onCreateClick}
          className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] font-bold rounded-xl text-xs transition-all shrink-0 min-h-[36px] active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredGoals.map(goal => (
            <div
              key={goal.id}
              className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-[var(--accent)]/50 transition-all space-y-4 shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-6 h-6 rounded bg-[var(--warm)]/10 text-[var(--warm)] border border-[var(--warm)]/20 flex items-center justify-center shrink-0">
                      <Target className="w-3.5 h-3.5 text-[var(--warm)]" />
                    </div>
                    <h3 className="font-semibold text-[var(--text)] text-sm line-clamp-2 font-sans">{goal.title}</h3>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 uppercase tracking-wider border ${
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

                <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-3">
                  <span className="capitalize">{goal.goal_type.replace(/_/g, ' ')}</span>
                  <span>•</span>
                  <span className="capitalize">{goal.platform || 'All Platforms'}</span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--muted)]">
                      <span className="font-mono text-[var(--text)] font-bold">{goal.current || 0}</span> / {goal.target} {goal.goal_type === 'problems_solved' ? 'Problems' : ''}
                    </span>
                    <span className="font-mono font-bold text-[var(--text)] text-xs">
                      {goal.progress_percentage || 0}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden border border-[var(--border)]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        goal.status === 'completed' ? 'bg-[var(--accent)]' : 'bg-[var(--warm)]'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress_percentage || 0)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-[var(--border)] text-xs text-[var(--muted)]">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
                  <span>Ends {goal.end_date}</span>
                </div>

                <button
                  onClick={() => onDeleteGoal(goal.id)}
                  className="text-[var(--muted)] hover:text-[var(--danger)] transition-colors p-1 rounded hover:bg-[var(--danger)]/10 flex items-center justify-center"
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
        <div className="bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-xl p-8 sm:p-12 text-center flex flex-col items-center justify-center">
          <Target className="w-10 h-10 text-[var(--muted)] mb-3" />
          <h4 className="text-sm font-semibold text-[var(--text)]">No goals found</h4>
          <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">
            {goals.length === 0
              ? 'Create your first goal to track target problems, active days, or contest ratings.'
              : `No ${filter} goals found.`}
          </p>
          <button
            onClick={onCreateClick}
            className="mt-4 px-4 py-2 bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] rounded-lg text-xs font-semibold transition-all min-h-[38px] flex items-center"
          >
            Create a Goal →
          </button>
        </div>
      )}
    </div>
  );
};

