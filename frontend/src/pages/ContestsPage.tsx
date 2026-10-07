import React, { useState, useMemo } from 'react';
import {
  Trophy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Search,
  Award,
  Zap,
  TrendingUp,
  Calendar,
  Filter,
  BarChart3,
  Layers,
  ChevronDown
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { ContestRecord, PlatformType } from '../types';
import { PlatformIcon } from '../components/PlatformIcon';
import { ContestDetailModal } from '../components/ContestDetailModal';

interface ContestsPageProps {
  contests: ContestRecord[];
  onConnectClick: () => void;
}

type TimeRange = '7D' | '30D' | '3M' | '6M' | '1Y' | 'ALL';
type SortOption = 'newest' | 'oldest' | 'best_rank' | 'largest_gain' | 'largest_loss';

export const ContestsPage: React.FC<ContestsPageProps> = ({ contests, onConnectClick }) => {
  // Global & Graph Filters
  const [selectedRange, setSelectedRange] = useState<TimeRange>('ALL');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Table Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tableDeltaFilter, setTableDeltaFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Detail Modal State
  const [selectedContest, setSelectedContest] = useState<ContestRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper date formatter
  const formatDate = (dateStr: string, includeYear: boolean = true) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        ...(includeYear ? { year: 'numeric' } : {})
      });
    } catch {
      return dateStr;
    }
  };

  // 1. KPI Metrics calculations across all contests
  const kpiMetrics = useMemo(() => {
    if (!contests || contests.length === 0) {
      return {
        total: 0,
        bestRank: null as number | null,
        bestRankContest: null as string | null,
        highestRating: null as number | null,
        highestRatingContest: null as string | null,
        highestRatingDate: null as string | null,
        avgDelta: null as number | null,
        maxGain: null as { delta: number; contest: string } | null,
        positiveDeltaRate: null as number | null,
        recentTrajectory: null as { delta: number; count: number } | null
      };
    }

    let minRank: number | null = null;
    let minRankContest: string | null = null;
    let maxRating: number | null = null;
    let maxRatingContest: string | null = null;
    let maxRatingDate: string | null = null;
    let totalDelta = 0;
    let ratedCount = 0;
    let positiveCount = 0;
    let maxGain: { delta: number; contest: string } | null = null;

    contests.forEach(c => {
      // Best rank
      if (typeof c.rank === 'number' && c.rank > 0) {
        if (minRank === null || c.rank < minRank) {
          minRank = c.rank;
          minRankContest = c.name;
        }
      }

      // Rating after
      const rating = typeof c.rating_after === 'number' ? c.rating_after : null;
      if (rating !== null && rating > 0) {
        if (maxRating === null || rating > maxRating) {
          maxRating = rating;
          maxRatingContest = c.name;
          maxRatingDate = c.contest_date;
        }
      }

      // Rating delta
      if (typeof c.rating_change === 'number') {
        totalDelta += c.rating_change;
        ratedCount++;
        if (c.rating_change > 0) {
          positiveCount++;
          if (!maxGain || c.rating_change > maxGain.delta) {
            maxGain = { delta: c.rating_change, contest: c.name };
          }
        }
      }
    });

    const avg = ratedCount > 0 ? Math.round(totalDelta / ratedCount) : null;
    const positiveRate = ratedCount > 0 ? Math.round((positiveCount / ratedCount) * 100) : null;

    // Chronological sort for recent trajectory (last 5 rated contests)
    const sortedChronological = [...contests]
      .filter(c => typeof c.rating_change === 'number')
      .sort((a, b) => new Date(a.contest_date).getTime() - new Date(b.contest_date).getTime());

    let recentTrajectory: { delta: number; count: number } | null = null;
    if (sortedChronological.length > 0) {
      const lastN = sortedChronological.slice(-5);
      const deltaSum = lastN.reduce((sum, c) => sum + (c.rating_change || 0), 0);
      recentTrajectory = { delta: deltaSum, count: lastN.length };
    }

    return {
      total: contests.length,
      bestRank: minRank,
      bestRankContest: minRankContest,
      highestRating: maxRating,
      highestRatingContest: maxRatingContest,
      highestRatingDate: maxRatingDate,
      avgDelta: avg,
      maxGain,
      positiveDeltaRate: positiveRate,
      recentTrajectory
    };
  }, [contests]);

  // 2. Chronological dataset for Charts (filtered by range & platform)
  const chartData = useMemo(() => {
    if (!contests || contests.length === 0) return [];

    // Filter by platform
    let list = contests.filter(c => {
      if (platformFilter === 'all') return true;
      return c.platform.toLowerCase() === platformFilter.toLowerCase();
    });

    // Sort chronologically (oldest to newest)
    list = [...list].sort(
      (a, b) => new Date(a.contest_date).getTime() - new Date(b.contest_date).getTime()
    );

    // Apply time range filter
    if (selectedRange !== 'ALL' && list.length > 0) {
      const timestamps = list.map(c => new Date(c.contest_date).getTime()).filter(t => !isNaN(t));
      const latestTime = timestamps.length > 0 ? Math.max(...timestamps) : Date.now();
      const cutoff = new Date(latestTime);

      if (selectedRange === '7D') cutoff.setDate(cutoff.getDate() - 7);
      else if (selectedRange === '30D') cutoff.setDate(cutoff.getDate() - 30);
      else if (selectedRange === '3M') cutoff.setMonth(cutoff.getMonth() - 3);
      else if (selectedRange === '6M') cutoff.setMonth(cutoff.getMonth() - 6);
      else if (selectedRange === '1Y') cutoff.setFullYear(cutoff.getFullYear() - 1);

      list = list.filter(c => new Date(c.contest_date).getTime() >= cutoff.getTime());
    }

    // Format for Recharts
    return list.map(c => {
      const rating = typeof c.rating_after === 'number' && c.rating_after > 0
        ? c.rating_after
        : typeof c.rating_before === 'number' && typeof c.rating_change === 'number'
        ? c.rating_before + c.rating_change
        : null;

      return {
        ...c,
        rating,
        dateFormatted: formatDate(c.contest_date, false),
        fullDateFormatted: formatDate(c.contest_date, true),
        delta: typeof c.rating_change === 'number' ? c.rating_change : 0
      };
    });
  }, [contests, platformFilter, selectedRange]);

  // Contests with valid ratings for the main rating line
  const ratingChartData = useMemo(() => {
    return chartData.filter(d => typeof d.rating === 'number' && d.rating > 0);
  }, [chartData]);

  // Contests with valid ranks for the rank progression chart
  const rankChartData = useMemo(() => {
    return chartData.filter(d => typeof d.rank === 'number' && d.rank > 0);
  }, [chartData]);

  // Contests with rating change for the delta chart
  const deltaChartData = useMemo(() => {
    return chartData.filter(d => typeof d.rating_change === 'number');
  }, [chartData]);

  // 3. Filtered & Sorted Contests for History Table
  const tableContests = useMemo(() => {
    let result = [...contests];

    // Filter by Platform
    if (platformFilter !== 'all') {
      result = result.filter(c => c.platform.toLowerCase() === platformFilter.toLowerCase());
    }

    // Filter by Rating Delta
    if (tableDeltaFilter === 'positive') {
      result = result.filter(c => typeof c.rating_change === 'number' && c.rating_change > 0);
    } else if (tableDeltaFilter === 'negative') {
      result = result.filter(c => typeof c.rating_change === 'number' && c.rating_change < 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.platform.toLowerCase().includes(q) ||
          (c.external_contest_id && c.external_contest_id.toLowerCase().includes(q))
      );
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.contest_date).getTime() - new Date(a.contest_date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.contest_date).getTime() - new Date(b.contest_date).getTime();
      }
      if (sortBy === 'best_rank') {
        const rankA = typeof a.rank === 'number' && a.rank > 0 ? a.rank : 9999999;
        const rankB = typeof b.rank === 'number' && b.rank > 0 ? b.rank : 9999999;
        return rankA - rankB;
      }
      if (sortBy === 'largest_gain') {
        const deltaA = typeof a.rating_change === 'number' ? a.rating_change : -999999;
        const deltaB = typeof b.rating_change === 'number' ? b.rating_change : -999999;
        return deltaB - deltaA;
      }
      if (sortBy === 'largest_loss') {
        const deltaA = typeof a.rating_change === 'number' ? a.rating_change : 999999;
        const deltaB = typeof b.rating_change === 'number' ? b.rating_change : 999999;
        return deltaA - deltaB;
      }
      return 0;
    });

    return result;
  }, [contests, platformFilter, tableDeltaFilter, searchQuery, sortBy]);

  // Open modal handler
  const handleRowClick = (contest: ContestRecord) => {
    setSelectedContest(contest);
    setIsModalOpen(true);
  };

  const timeRanges: TimeRange[] = ['7D', '30D', '3M', '6M', '1Y', 'ALL'];

  return (
    <div className="space-y-6">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">
              Contests
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-[var(--surface)] text-[var(--accent)] border border-[var(--border)]">
              {contests.length} {contests.length === 1 ? 'Contest' : 'Contests'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            Track rating progression, contest performance, and competitive growth across platforms.
          </p>
        </div>

        {/* Global Platform Selector */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              aria-label="Filter by platform"
              className="px-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium transition-colors"
            >
              <option value="all">All Platforms</option>
              <option value="codeforces">Codeforces</option>
              <option value="leetcode">LeetCode</option>
              <option value="codechef">CodeChef</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Contests Participated */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl relative overflow-hidden group hover:border-[var(--border-subtle)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block">
              Contests Participated
            </span>
            <Trophy className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--text)] transition-colors" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text)] mt-2">
            {kpiMetrics.total}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-1 truncate">
            {platformFilter === 'all' ? 'Across all rated platforms' : `Verified on ${platformFilter}`}
          </p>
        </div>

        {/* Card 2: Best Rank */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl relative overflow-hidden group hover:border-[var(--border-subtle)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block">
              Best Rank
            </span>
            <Award className="w-4 h-4 text-[var(--warm)]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[var(--text)] mt-2">
            {kpiMetrics.bestRank !== null ? `#${kpiMetrics.bestRank}` : '—'}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-1 truncate">
            {kpiMetrics.bestRankContest ? `in ${kpiMetrics.bestRankContest}` : 'Career high placement'}
          </p>
        </div>

        {/* Card 3: Highest Rating */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl relative overflow-hidden group hover:border-[var(--border-subtle)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block">
              Highest Rating
            </span>
            <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-mono text-[var(--accent)] mt-2">
            {kpiMetrics.highestRating !== null ? kpiMetrics.highestRating : '—'}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-1 truncate">
            Personal best
          </p>
        </div>

        {/* Card 4: Average Rating Delta */}
        <div className="p-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl relative overflow-hidden group hover:border-[var(--border-subtle)] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--muted)] block">
              Average Delta
            </span>
            <Zap className="w-4 h-4 text-[var(--muted)] group-hover:text-[var(--accent)] transition-colors" />
          </div>
          <p
            className={`text-2xl sm:text-3xl font-bold font-mono mt-2 ${
              kpiMetrics.avgDelta !== null && kpiMetrics.avgDelta > 0
                ? 'text-[var(--accent)]'
                : kpiMetrics.avgDelta !== null && kpiMetrics.avgDelta < 0
                ? 'text-[var(--danger)]'
                : 'text-[var(--muted)]'
            }`}
          >
            {kpiMetrics.avgDelta !== null
              ? kpiMetrics.avgDelta > 0
                ? `+${kpiMetrics.avgDelta}`
                : kpiMetrics.avgDelta
              : '—'}
          </p>
          <p className="text-[11px] text-[var(--muted)] mt-1 truncate">
            Across rated contests
          </p>
        </div>
      </div>

      {/* 3. Main Rating Performance Graph */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
        {/* Graph Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[var(--text)] tracking-tight font-sans">
                Rating Performance
              </h2>
            </div>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Track how your competitive programming rating has changed over time.
            </p>
          </div>

          {/* Range Selector Controls */}
          <div className="flex items-center gap-1 bg-[var(--bg)] p-1 rounded-lg border border-[var(--border)] self-start sm:self-auto overflow-x-auto max-w-full">
            {timeRanges.map(range => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-2.5 py-1 text-[11px] font-mono font-medium rounded-md transition-all whitespace-nowrap ${
                  selectedRange === range
                    ? 'bg-[var(--surface)] text-[var(--accent)] border border-[var(--accent)]/30 shadow-xs'
                    : 'text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 sm:h-80 w-full">
          {ratingChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={ratingChartData}
                margin={{ top: 12, right: 12, left: -16, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ratingAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="dateFormatted"
                  stroke="var(--muted)"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--border)' }}
                  minTickGap={28}
                />
                <YAxis
                  stroke="var(--muted)"
                  tick={{ fill: 'var(--muted)', fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 35', 'dataMax + 35']}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const point = payload[0].payload;
                      const change = point.rating_change;
                      const hasChange = typeof change === 'number';
                      const isGain = hasChange && change > 0;
                      const isLoss = hasChange && change < 0;

                      return (
                        <div className="bg-[var(--bg)] border border-[var(--border)] rounded-xl p-3.5 shadow-2xl text-xs space-y-1.5 min-w-[210px]">
                          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2 mb-1 gap-2">
                            <span className="font-semibold text-[var(--text)] truncate max-w-[150px]">
                              {point.name}
                            </span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)]">
                              {point.platform}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[var(--muted)]">
                            <span>Date:</span>
                            <span className="font-mono text-[var(--text)]">{point.fullDateFormatted}</span>
                          </div>

                          <div className="flex items-center justify-between text-[var(--muted)]">
                            <span>Rank:</span>
                            <span className="font-mono text-[var(--text)] font-semibold">
                              {point.rank !== null && point.rank !== undefined ? `#${point.rank}` : '—'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[var(--muted)]">
                            <span>Previous Rating:</span>
                            <span className="font-mono text-[var(--text)]">
                              {point.rating_before !== null && point.rating_before !== undefined
                                ? point.rating_before
                                : '—'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[var(--muted)]">
                            <span>New Rating:</span>
                            <span className="font-mono text-[var(--accent)] font-bold">
                              {point.rating}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[var(--muted)] pt-1 border-t border-[var(--border)]">
                            <span>Delta:</span>
                            <span
                              className={`font-mono font-bold ${
                                isGain
                                  ? 'text-[var(--accent)]'
                                  : isLoss
                                  ? 'text-[var(--danger)]'
                                  : 'text-[var(--muted)]'
                              }`}
                            >
                              {hasChange ? (isGain ? `+${change}` : change) : '—'}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rating"
                  stroke="var(--accent)"
                  strokeWidth={2.5}
                  fill="url(#ratingAreaGradient)"
                  activeDot={{
                    r: 6,
                    fill: 'var(--accent)',
                    stroke: 'var(--bg)',
                    strokeWidth: 2
                  }}
                  dot={{
                    r: 3,
                    fill: 'var(--accent)',
                    strokeWidth: 0
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <BarChart3 className="w-8 h-8 text-[var(--muted)] opacity-40 mb-1" />
              <p className="text-sm font-medium text-[var(--text)]">No rating data in selected range</p>
              <p className="text-xs text-[var(--muted)] max-w-sm">
                Try selecting &quot;ALL&quot; or clearing the platform filter to view your full rating progression.
              </p>
              {selectedRange !== 'ALL' && (
                <button
                  onClick={() => setSelectedRange('ALL')}
                  className="mt-2 text-xs font-mono text-[var(--accent)] hover:underline"
                >
                  Reset time range
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. Secondary Visualizations (Side-by-side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Viz A: Rating Delta Bar Chart */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-[var(--accent)]" />
              <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">
                Rating Delta Distribution
              </h3>
            </div>
            <p className="text-xs text-[var(--muted)] mb-4">
              Rating gained (+) or lost (-) per rated contest
            </p>
          </div>

          <div className="h-48 sm:h-52 w-full">
            {deltaChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deltaChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="dateFormatted"
                    stroke="var(--muted)"
                    tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    minTickGap={24}
                  />
                  <YAxis
                    stroke="var(--muted)"
                    tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        const change = item.delta;
                        const isGain = change > 0;
                        const isLoss = change < 0;

                        return (
                          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2.5 shadow-xl text-xs space-y-1">
                            <div className="font-semibold text-[var(--text)] truncate max-w-[180px]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[var(--muted)] font-mono">
                              {item.fullDateFormatted}
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--border)]">
                              <span className="text-[var(--muted)]">Rating Delta:</span>
                              <span
                                className={`font-mono font-bold ${
                                  isGain
                                    ? 'text-[var(--accent)]'
                                    : isLoss
                                    ? 'text-[var(--danger)]'
                                    : 'text-[var(--muted)]'
                                }`}
                              >
                                {isGain ? `+${change}` : change}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
                    {deltaChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.delta > 0
                            ? 'var(--accent)'
                            : entry.delta < 0
                            ? 'var(--danger)'
                            : 'var(--muted)'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--muted)]">
                No rated contest changes in this period
              </div>
            )}
          </div>
        </div>

        {/* Viz B: Leaderboard Rank Progression */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--warm)]" />
                <h3 className="font-semibold text-[var(--text)] text-sm tracking-tight font-sans">
                  Leaderboard Rank Progression
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)] px-2 py-0.5 rounded bg-[var(--bg)] border border-[var(--border)]">
                Lower rank = Better
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] mb-4">
              Finish placement per contest (inverted scale)
            </p>
          </div>

          <div className="h-48 sm:h-52 w-full">
            {rankChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rankChartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="dateFormatted"
                    stroke="var(--muted)"
                    tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={{ stroke: 'var(--border)' }}
                    minTickGap={24}
                  />
                  <YAxis
                    reversed={true}
                    stroke="var(--muted)"
                    tick={{ fill: 'var(--muted)', fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={val => `#${val}`}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="bg-[var(--bg)] border border-[var(--border)] rounded-lg p-2.5 shadow-xl text-xs space-y-1">
                            <div className="font-semibold text-[var(--text)] truncate max-w-[180px]">
                              {item.name}
                            </div>
                            <div className="text-[11px] text-[var(--muted)] font-mono">
                              {item.fullDateFormatted}
                            </div>
                            <div className="flex items-center justify-between gap-3 pt-1 border-t border-[var(--border)]">
                              <span className="text-[var(--muted)]">Finishing Rank:</span>
                              <span className="font-mono font-bold text-[var(--warm)]">
                                #{item.rank}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rank"
                    stroke="var(--warm)"
                    strokeWidth={2}
                    dot={{ r: 2.5, fill: 'var(--warm)', strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'var(--warm)', stroke: 'var(--bg)', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-[var(--muted)]">
                No rank data available in this period
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Performance Insights */}
      {contests.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Insight 1: Recent Momentum */}
          <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
              <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide block">
                Recent Momentum
              </span>
              <p className="text-sm font-semibold font-mono text-[var(--text)] mt-0.5">
                {kpiMetrics.recentTrajectory
                  ? `${kpiMetrics.recentTrajectory.delta >= 0 ? '+' : ''}${kpiMetrics.recentTrajectory.delta} pts`
                  : '—'}
              </p>
              <p className="text-[11px] text-[var(--muted)] truncate">
                {kpiMetrics.recentTrajectory
                  ? `Over last ${kpiMetrics.recentTrajectory.count} rated contests`
                  : 'Insufficient contest count'}
              </p>
            </div>
          </div>

          {/* Insight 2: Peak Rating Benchmark */}
          <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
              <Trophy className="w-4 h-4 text-[var(--warm)]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide block">
                Peak Rating
              </span>
              <p className="text-sm font-semibold font-mono text-[var(--accent)] mt-0.5">
                {kpiMetrics.highestRating ?? '—'}
              </p>
              <p className="text-[11px] text-[var(--muted)] truncate">
                {kpiMetrics.highestRatingDate ? formatDate(kpiMetrics.highestRatingDate) : 'All-time personal best'}
              </p>
            </div>
          </div>

          {/* Insight 3: Standout Placement */}
          <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
              <Award className="w-4 h-4 text-[var(--text)]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide block">
                Best Standing
              </span>
              <p className="text-sm font-semibold font-mono text-[var(--text)] mt-0.5">
                {kpiMetrics.bestRank !== null ? `#${kpiMetrics.bestRank}` : '—'}
              </p>
              <p className="text-[11px] text-[var(--muted)] truncate">
                {kpiMetrics.bestRankContest ?? 'Career high placement'}
              </p>
            </div>
          </div>

          {/* Insight 4: Strongest Leap */}
          <div className="p-3.5 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--bg)] border border-[var(--border)] shrink-0">
              <Zap className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-mono text-[var(--muted)] uppercase tracking-wide block">
                Strongest Gain
              </span>
              <p className="text-sm font-semibold font-mono text-[var(--accent)] mt-0.5">
                {kpiMetrics.maxGain ? `+${kpiMetrics.maxGain.delta}` : '—'}
              </p>
              <p className="text-[11px] text-[var(--muted)] truncate">
                {kpiMetrics.maxGain ? `in ${kpiMetrics.maxGain.contest}` : 'Single-contest record'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 6. Contest History Table */}
      <div className="space-y-3">
        {/* Table Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[var(--text)] tracking-tight font-sans">
              Contest History
            </h3>
            <span className="text-xs font-mono text-[var(--muted)] px-2 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">
              {tableContests.length} of {contests.length}
            </span>
          </div>

          {/* Filters & Search Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative min-w-[180px] sm:min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search contests..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] transition-colors"
              />
            </div>

            {/* Delta Filter */}
            <select
              value={tableDeltaFilter}
              onChange={e => setTableDeltaFilter(e.target.value as any)}
              aria-label="Filter by rating delta"
              className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium transition-colors"
            >
              <option value="all">All Deltas</option>
              <option value="positive">Rating Gain (+)</option>
              <option value="negative">Rating Loss (-)</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortOption)}
              aria-label="Sort contests"
              className="px-2.5 py-1.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="best_rank">Best Rank</option>
              <option value="largest_gain">Largest Gain</option>
              <option value="largest_loss">Largest Loss</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {tableContests.length > 0 ? (
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden shadow-sm">
            <div className="overflow-x-auto touch-scroll">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--bg)]/60 text-[var(--muted)] font-mono text-[11px] uppercase tracking-wider">
                    <th className="py-2.5 px-3.5 font-normal">Platform</th>
                    <th className="py-2.5 px-3.5 font-normal">Contest Name</th>
                    <th className="py-2.5 px-3.5 font-normal">Date</th>
                    <th className="py-2.5 px-3.5 font-normal">Rank</th>
                    <th className="py-2.5 px-3.5 font-normal">Old Rating</th>
                    <th className="py-2.5 px-3.5 font-normal">New Rating</th>
                    <th className="py-2.5 px-3.5 font-normal">Delta</th>
                    <th className="py-2.5 px-3.5 text-right font-normal">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
                  {tableContests.map((c, idx) => {
                    const change = c.rating_change;
                    const isPositive = typeof change === 'number' && change > 0;
                    const isNegative = typeof change === 'number' && change < 0;

                    return (
                      <tr
                        key={`${c.platform}-${c.external_contest_id || idx}`}
                        onClick={() => handleRowClick(c)}
                        className="hover:bg-[var(--surface-hover)] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-3.5 font-mono capitalize font-medium text-[var(--text)]">
                          <div className="flex items-center gap-2">
                            <PlatformIcon platform={c.platform} className="w-4 h-4 shrink-0" />
                            <span>{c.platform}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-medium text-[var(--text)] max-w-xs truncate">
                          <span className="group-hover:text-[var(--accent)] transition-colors">
                            {c.name}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[11px] text-[var(--muted)] whitespace-nowrap">
                          {formatDate(c.contest_date)}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-medium text-[var(--text)]">
                          {c.rank !== null && c.rank !== undefined ? `#${c.rank}` : '—'}
                        </td>
                        <td className="py-3 px-3.5 font-mono text-[var(--muted)]">
                          {c.rating_before !== null && c.rating_before !== undefined ? c.rating_before : '—'}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-semibold text-[var(--text)]">
                          {c.rating_after !== null && c.rating_after !== undefined ? c.rating_after : '—'}
                        </td>
                        <td className="py-3 px-3.5 font-mono font-semibold whitespace-nowrap">
                          {change !== null && change !== undefined ? (
                            <span
                              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] ${
                                isPositive
                                  ? 'text-[var(--accent)] bg-[var(--accent)]/10'
                                  : isNegative
                                  ? 'text-[var(--danger)] bg-[var(--danger)]/10'
                                  : 'text-[var(--muted)] bg-[var(--bg)]'
                              }`}
                            >
                              {isPositive && <ArrowUpRight className="w-3 h-3" />}
                              {isNegative && <ArrowDownRight className="w-3 h-3" />}
                              {!isPositive && !isNegative && <Minus className="w-3 h-3" />}
                              <span>{isPositive ? `+${change}` : change}</span>
                            </span>
                          ) : (
                            <span className="text-[var(--muted)]">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3.5 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                                className="p-1.5 rounded-md text-[var(--muted)] hover:text-[var(--accent)] hover:bg-[var(--bg)] transition-colors"
                                title="Open official standings"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleRowClick(c);
                              }}
                              className="px-2 py-1 rounded text-[11px] font-mono text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
            <Trophy className="w-8 h-8 text-[var(--muted)] mx-auto opacity-40 mb-2" />
            <p className="text-sm font-medium text-[var(--text)]">No contests found</p>
            <p className="text-xs text-[var(--muted)] max-w-sm mx-auto">
              {contests.length === 0
                ? 'Connect your Codeforces, LeetCode, or CodeChef account to import verified contest rating history.'
                : 'No contests matched your search or filter criteria.'}
            </p>
            {contests.length === 0 ? (
              <button
                onClick={onConnectClick}
                className="mt-2 px-3.5 py-1.5 rounded-lg bg-[var(--primary)] text-[var(--on-primary)] text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Connect platform
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setTableDeltaFilter('all');
                  setPlatformFilter('all');
                }}
                className="mt-2 text-xs font-mono text-[var(--accent)] hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* 7. Contest Detail Modal */}
      <ContestDetailModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedContest(null);
        }}
        contest={selectedContest}
      />
    </div>
  );
};
