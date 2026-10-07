import React, { useState, useEffect } from 'react';
import {
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Users,
  FolderGit2,
  GitCommit,
  GitBranch,
  Star
} from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface GitHubPageProps {
  user: UserProfile | null;
}

export const GitHubPage: React.FC<GitHubPageProps> = () => {
  const [username, setUsername] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHub = async (userToFetch?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getGitHub(userToFetch);
      const ghData = res?.data !== undefined ? res.data : res;
      if (ghData && (ghData.login || ghData.username || ghData.public_repos !== undefined)) {
        setData(ghData);
        if (ghData.login || ghData.username) {
          setUsername(ghData.login || ghData.username);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch GitHub data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHub();
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    await fetchGitHub(username.trim());
  };

  const ghUser = data?.login || data?.username;
  const isConnected = !!(data && (data.login || data.username || data.connected));

  return (
    <div className="space-y-4">
      {/* 1. Page Header */}
      <div className="pb-3 border-b border-[var(--border)]">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
          GitHub Integration
        </h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Link your GitHub handle to cross-reference software repositories alongside competitive problem solving
        </p>
      </div>

      {/* 2. Connect / Search Form */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
        <form onSubmit={handleConnect} className="space-y-3">
          <div>
            <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5">
              GitHub Username
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="e.g. torvalds, octocat"
                className="flex-1 px-3.5 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] font-mono min-h-[34px]"
              />
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="px-4 py-1.5 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-[var(--on-primary)] rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2 min-h-[34px] shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Fetching...' : isConnected ? 'Update Handle' : 'Connect GitHub'}</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="p-2.5 bg-[var(--danger-muted)] border border-[var(--danger)]/30 rounded-lg flex items-center gap-2 text-xs text-[var(--danger)] font-mono">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* 3. GitHub Profile & Metrics */}
      {isConnected && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              {data.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt={ghUser}
                  className="w-10 h-10 rounded-lg border border-[var(--border)] object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--text)] font-mono">
                  GH
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-[var(--text)] font-mono">@{ghUser}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-semibold bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20 font-mono">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Connected</span>
                  </span>
                </div>
                {data.bio && <p className="text-xs text-[var(--muted)] mt-0.5">{data.bio}</p>}
              </div>
            </div>

            {(data.html_url || data.profile_url) && (
              <a
                href={data.html_url || data.profile_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg)] hover:bg-[var(--surface-hover)] text-[var(--text)] border border-[var(--border)] rounded-lg text-xs font-medium transition self-start sm:self-auto"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* GitHub Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Public Repos</span>
              <p className="text-base font-bold text-[var(--text)] font-mono mt-1">{data.public_repos ?? 0}</p>
            </div>
            <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Followers</span>
              <p className="text-base font-bold text-[var(--text)] font-mono mt-1">{data.followers ?? 0}</p>
            </div>
            <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Following</span>
              <p className="text-base font-bold text-[var(--text)] font-mono mt-1">{data.following ?? 0}</p>
            </div>
            <div className="p-3 bg-[var(--bg)] border border-[var(--border-subtle)] rounded-lg">
              <span className="text-[10px] text-[var(--muted)] uppercase font-mono block">Public Gists</span>
              <p className="text-base font-bold text-[var(--text)] font-mono mt-1">{data.public_gists ?? 0}</p>
            </div>
          </div>

          {/* Cross-reference notice */}
          <div className="p-3 rounded-lg bg-[var(--bg)] border border-[var(--border-subtle)] flex items-center gap-2.5 text-xs text-[var(--muted)] font-mono">
            <GitCommit className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>
              Connected to CodePulse. Public repositories and profile activity are synchronized with your telemetry dashboard.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
