import React, { useEffect } from 'react';
import { X, ExternalLink, Trophy, TrendingUp, TrendingDown, Minus, Calendar, Award, CheckCircle2 } from 'lucide-react';
import { ContestRecord } from '../types';
import { PlatformIcon } from './PlatformIcon';

interface ContestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  contest: ContestRecord | null;
}

export const ContestDetailModal: React.FC<ContestDetailModalProps> = ({
  isOpen,
  onClose,
  contest
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !contest) return null;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const delta = contest.rating_change;
  const isPositive = typeof delta === 'number' && delta > 0;
  const isNegative = typeof delta === 'number' && delta < 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-[var(--surface)] border-t sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto touch-scroll safe-bottom"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile bottom sheet grab handle */}
        <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-start gap-3.5 mb-5 pr-8">
          <div className="w-11 h-11 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5">
            <PlatformIcon platform={contest.platform} className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)] text-[var(--muted)] font-medium">
                {contest.platform}
              </span>
              <span className="text-xs text-[var(--muted)] flex items-center gap-1 font-mono">
                <Calendar className="w-3 h-3" />
                {formatDate(contest.contest_date)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text)] mt-1 tracking-tight">
              {contest.name}
            </h3>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
          <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
            <div className="flex items-center gap-1.5 text-[var(--muted)] text-[11px] font-mono uppercase">
              <Award className="w-3.5 h-3.5" />
              <span>Rank</span>
            </div>
            <p className="text-lg font-bold font-mono text-[var(--text)] mt-1">
              {contest.rank !== null && contest.rank !== undefined ? `#${contest.rank}` : '—'}
            </p>
          </div>

          <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
            <div className="flex items-center gap-1.5 text-[var(--muted)] text-[11px] font-mono uppercase">
              <Trophy className="w-3.5 h-3.5" />
              <span>New Rating</span>
            </div>
            <p className="text-lg font-bold font-mono text-[var(--accent)] mt-1">
              {contest.rating_after !== null && contest.rating_after !== undefined ? contest.rating_after : '—'}
            </p>
          </div>

          <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl col-span-2 sm:col-span-1">
            <div className="flex items-center gap-1.5 text-[var(--muted)] text-[11px] font-mono uppercase">
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-[var(--accent)]" />
              ) : isNegative ? (
                <TrendingDown className="w-3.5 h-3.5 text-[var(--danger)]" />
              ) : (
                <Minus className="w-3.5 h-3.5 text-[var(--muted)]" />
              )}
              <span>Rating Delta</span>
            </div>
            <p
              className={`text-lg font-bold font-mono mt-1 ${
                isPositive
                  ? 'text-[var(--accent)]'
                  : isNegative
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--muted)]'
              }`}
            >
              {typeof delta === 'number' ? (isPositive ? `+${delta}` : `${delta}`) : '—'}
            </p>
          </div>
        </div>

        {/* Rating Transition Bar */}
        <div className="p-4 bg-[var(--bg)] border border-[var(--border)] rounded-xl mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--muted)]">Rating Before:</span>
            <span className="text-[var(--text)] font-semibold">
              {contest.rating_before !== null && contest.rating_before !== undefined ? contest.rating_before : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--muted)]">Rating After:</span>
            <span className="text-[var(--accent)] font-semibold">
              {contest.rating_after !== null && contest.rating_after !== undefined ? contest.rating_after : '—'}
            </span>
          </div>
          {typeof contest.problems_solved === 'number' && (
            <div className="flex items-center justify-between text-xs font-mono pt-1 border-t border-[var(--border)]">
              <span className="text-[var(--muted)]">Problems Solved:</span>
              <span className="text-[var(--text)] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-[var(--accent)]" />
                {contest.problems_solved}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border)]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-medium text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
          >
            Close
          </button>
          {contest.url && (
            <a
              href={contest.url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity inline-flex items-center gap-1.5"
            >
              <span>View Standings</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
