import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Users, FolderGit2, GitPullRequest } from 'lucide-react';
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
      if (ghData) {
        setData(ghData);
        if (ghData.username) {
          setUsername(ghData.username);
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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Page Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">GitHub Telemetry Integration</h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          Link your GitHub handle to cross-reference open source contributions alongside competitive programming statistics.
        </p>
      </div>

      {/* GitHub Account Connect Form */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5 font-mono">
              GitHub Username
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. torvalds, octocat"
                  className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] placeholder-[var(--muted)]/60 focus:outline-none focus:border-[var(--accent)] font-mono min-h-[38px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="px-4 py-2 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-[var(--on-primary)] rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 min-h-[38px]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Linking...' : 'Connect GitHub'}</span>
              </button>
            </div>
            <p className="text-[11px] text-[var(--muted)] mt-1.5 font-mono">
              Queries public GitHub GraphQL/REST APIs to track repositories and followers alongside problem telemetry.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg flex items-center gap-2 text-xs text-[var(--danger)]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* GitHub Profile Card */}
      {data?.connected && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 space-y-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3.5">
              {data.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt={data.username}
                  className="w-12 h-12 rounded-xl border border-[var(--border)] object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center font-bold text-sm text-[var(--text)] font-mono">
                  GH
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[var(--text)] font-sans">@{data.username}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 font-mono uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Linked</span>
                  </span>
                </div>
                {data.bio && <p className="text-xs text-[var(--muted)] mt-0.5 max-w-md">{data.bio}</p>}
              </div>
            </div>

            {data.profile_url && (
              <a
                href={data.profile_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[var(--bg)] hover:bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-lg text-xs font-semibold transition-colors min-h-[38px] self-start sm:self-auto"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* GitHub Metrics Grid */}
          <div className="grid grid-cols-1 2xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <FolderGit2 className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">Public Repos</span>
                <p className="text-lg font-bold text-[var(--text)] font-mono mt-0.5">{data.public_repos ?? 0}</p>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">Followers</span>
                <p className="text-lg font-bold text-[var(--text)] font-mono mt-0.5">{data.followers ?? 0}</p>
              </div>
            </div>

            <div className="p-3.5 bg-[var(--bg)] border border-[var(--border)] rounded-xl flex items-center gap-3 2xs:col-span-2 sm:col-span-1">
              <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
                <GitPullRequest className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <span className="text-[10px] text-[var(--muted)] uppercase tracking-wider font-semibold block font-mono">Telemetry Sync</span>
                <p className="text-xs font-semibold text-[var(--accent)] font-mono mt-0.5 uppercase tracking-wider">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

