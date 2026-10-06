import React, { useState } from 'react';
import { X, Target } from 'lucide-react';
import { PlatformType } from '../types';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (goalData: {
    title: string;
    goal_type: 'problems_solved' | 'active_days' | 'contest_rating' | 'contest_count' | 'platform_solved';
    target: number;
    platform?: PlatformType | null;
    start_date: string;
    end_date: string;
  }) => Promise<void>;
}

export const CreateGoalModal: React.FC<CreateGoalModalProps> = ({
  isOpen,
  onClose,
  onCreate
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);
  const nextMonthStr = nextMonth.toISOString().split('T')[0];

  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState<'problems_solved' | 'active_days' | 'contest_rating' | 'contest_count'>('problems_solved');
  const [target, setTarget] = useState('30');
  const [platform, setPlatform] = useState<string>('all');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextMonthStr);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a goal title');
      return;
    }
    const targetNum = Number(target);
    if (isNaN(targetNum) || targetNum <= 0) {
      setError('Target must be a positive number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreate({
        title: title.trim(),
        goal_type: goalType,
        target: targetNum,
        platform: platform === 'all' ? null : (platform as PlatformType),
        start_date: startDate,
        end_date: endDate
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to create goal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] border-t sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto touch-scroll safe-bottom">
        {/* Mobile bottom sheet grab handle */}
        <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Target className="w-5 h-5 text-[var(--warm)] shrink-0" />
          <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Create Coding Goal</h3>
        </div>
        <p className="text-xs text-[var(--muted)]">
          Set a measurable target calculated directly from your real platform activity.
        </p>

        <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Goal Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Solve 50 Problems in 30 Days"
              className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-base sm:text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-1 2xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Goal Metric</label>
              <select
                value={goalType}
                onChange={e => setGoalType(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
              >
                <option value="problems_solved">Problems Solved</option>
                <option value="active_days">Active Days</option>
                <option value="contest_rating">Contest Rating</option>
                <option value="contest_count">Contests Attended</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Target Value</label>
              <input
                type="number"
                value={target}
                onChange={e => setTarget(e.target.value)}
                min="1"
                inputMode="numeric"
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-base sm:text-sm font-mono text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1">Platform</label>
            <select
              value={platform}
              onChange={e => setPlatform(e.target.value)}
              className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[44px]"
            >
              <option value="all">All Connected Platforms</option>
              <option value="leetcode">LeetCode Only</option>
              <option value="codeforces">Codeforces Only</option>
              <option value="codechef">CodeChef Only</option>
              <option value="geeksforgeeks">GeeksforGeeks Only</option>
            </select>
          </div>

          <div className="grid grid-cols-1 2xs:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-base sm:text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-mono min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[var(--text)] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-base sm:text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-mono min-h-[44px]"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-[var(--danger)] bg-[var(--danger)]/10 p-3 rounded-lg border border-[var(--danger)]/30">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors min-h-[44px] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex items-center justify-center px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[var(--primary)] hover:opacity-90 disabled:opacity-40 text-[var(--on-primary)] transition-all shadow-sm min-h-[44px] active:scale-[0.98]"
            >
              {loading ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
