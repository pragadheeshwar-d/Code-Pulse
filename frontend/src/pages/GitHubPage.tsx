import React, { useState, useEffect } from 'react';
import { GitBranch, GitPullRequest, ExternalLink, RefreshCw, CheckCircle2, AlertCircle, Star, Users, FolderGit2 } from 'lucide-react';
import { api } from '../services/api';
import { UserProfile } from '../types';

interface GitHubPageProps {
  user: UserProfile | null;
}

export const GitHubPage: React.FC<GitHubPageProps> = ({ user }) => {
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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="pb-4 border-b border-[#1a2333]/80">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">GitHub Integration</h2>
        <p className="text-xs sm:text-sm text-[#8b9cb4] mt-0.5">
          Connect your GitHub account to sync public repositories, commit activity, and developer contributions.
        </p>
      </div>

      {/* GitHub Account Connect Form */}
      <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-4 sm:p-6">
        <form onSubmit={handleConnect} className="space-y-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-[#cbd5e1] mb-1.5">
              GitHub Username or Handle
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. torvalds, octocat"
                  className="w-full px-3.5 py-2.5 bg-[#141d2f] border border-[#22314e] rounded-lg text-sm text-white placeholder-[#64748b] focus:outline-none focus:border-blue-500 font-mono min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 text-white rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-2 min-h-[44px] active:scale-[0.98]"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Connecting...' : 'Connect GitHub'}</span>
              </button>
            </div>
            <p className="text-[11px] sm:text-xs text-[#64748b] mt-1.5">
              CodePulse queries public GitHub user profile metrics to track your open source footprint alongside competitive coding.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs sm:text-sm text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>

      {/* GitHub Profile Card */}
      {data?.connected && (
        <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1c263c]">
            <div className="flex items-center gap-4">
              {data.avatar_url ? (
                <img
                  src={data.avatar_url}
                  alt={data.username}
                  className="w-14 h-14 rounded-xl border border-[#2a3854] object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-[#162035] border border-[#2a3854] flex items-center justify-center font-bold text-xl text-white">
                  GH
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-white">@{data.username}</h3>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified</span>
                  </span>
                </div>
                {data.bio && <p className="text-xs text-[#8b9cb4] mt-0.5 max-w-md">{data.bio}</p>}
              </div>
            </div>

            {data.profile_url && (
              <a
                href={data.profile_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#162035] hover:bg-[#1f2d48] text-white border border-[#22314d] rounded-lg text-xs font-semibold transition-colors min-h-[44px] self-start sm:self-auto"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          {/* GitHub Metrics Grid */}
          <div className="grid grid-cols-1 2xs:grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="p-4 bg-[#141d2f] border border-[#1e2a42] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FolderGit2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-xs text-[#8b9cb4]">Public Repos</span>
                <p className="text-xl sm:text-2xl font-bold text-white font-mono">{data.public_repos ?? 0}</p>
              </div>
            </div>

            <div className="p-4 bg-[#141d2f] border border-[#1e2a42] rounded-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-xs text-[#8b9cb4]">Followers</span>
                <p className="text-xl sm:text-2xl font-bold text-white font-mono">{data.followers ?? 0}</p>
              </div>
            </div>

            <div className="p-4 bg-[#141d2f] border border-[#1e2a42] rounded-xl flex items-center gap-3 2xs:col-span-2 sm:col-span-1">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <GitPullRequest className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xs text-[#8b9cb4]">Sync Status</span>
                <p className="text-base font-semibold text-emerald-400 font-mono mt-0.5">Active</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
