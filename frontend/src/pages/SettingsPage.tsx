import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Clock,
  ExternalLink,
  Shield,
  User,
  Layers,
  RefreshCw,
  LogOut,
  ChevronDown,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { UserProfile, UserSettings, SyncLog, PlatformCardData, PlatformType } from '../types';
import { getAuthToken, removeAuthToken } from '../services/api';

interface SettingsPageProps {
  user: UserProfile | null;
  settings: UserSettings | null;
  platforms: PlatformCardData[];
  syncLogs: SyncLog[];
  onUpdateProfile: (data: Partial<UserProfile & UserSettings>) => Promise<void>;
  onDisconnectPlatform: (platform: PlatformType) => Promise<void>;
  onConnectPlatform?: (platform: PlatformType) => void;
  onLogout?: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  settings,
  platforms,
  syncLogs,
  onUpdateProfile,
  onDisconnectPlatform,
  onConnectPlatform,
  onLogout
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [autoSync, setAutoSync] = useState(settings?.auto_sync_interval || '12h');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [selectedLogForDetails, setSelectedLogForDetails] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setAutoSync(settings.auto_sync_interval || '12h');
    }
  }, [settings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await onUpdateProfile({
        name,
        email,
        auto_sync_interval: autoSync as any
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const hasSession = !!getAuthToken();

  return (
    <div className="space-y-5 max-w-4xl">
      {/* 1. Header */}
      <div className="pb-3 border-b border-[var(--border)]">
        <h2 className="text-lg sm:text-xl font-bold text-[var(--text)] tracking-tight font-sans">
          Settings
        </h2>
        <p className="text-xs text-[var(--muted)] mt-0.5">
          Account details, connected accounts, automated sync intervals, and security
        </p>
      </div>

      {/* 2. Profile Section */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
          <User className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--text)]">
            Profile
          </h3>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                className="w-full px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[34px]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--muted)] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[34px]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs font-mono text-[var(--accent)] flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Profile updated successfully</span>
              </span>
            ) : <span />}

            <button
              type="submit"
              disabled={saving}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--primary)] text-[var(--on-primary)] hover:opacity-90 transition min-h-[32px] disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Connected Accounts Section */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
          <Layers className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--text)]">
            Connections
          </h3>
        </div>

        <div className="divide-y divide-[var(--border-subtle)]">
          {platforms.map(p => (
            <div key={p.platform} className="py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[var(--text)] capitalize font-sans">{p.platform}</span>
                {p.connected ? (
                  <span className="text-[var(--accent)] font-mono text-[11px]">@{p.username}</span>
                ) : (
                  <span className="text-[var(--muted)] text-[11px] font-mono">Not linked</span>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {p.connected && p.profile_url && (
                  <a
                    href={p.profile_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[var(--muted)] hover:text-[var(--text)] flex items-center gap-1 transition"
                  >
                    <span>Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}

                {p.connected ? (
                  <button
                    onClick={() => onDisconnectPlatform(p.platform)}
                    className="text-[11px] text-[var(--danger)] hover:underline font-mono"
                  >
                    Disconnect
                  </button>
                ) : onConnectPlatform ? (
                  <button
                    onClick={() => onConnectPlatform(p.platform)}
                    className="text-[11px] text-[var(--accent)] hover:underline font-mono"
                  >
                    Connect
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Automated Sync Section */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
          <RefreshCw className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--text)]">
            Sync Preferences
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-medium text-[var(--text)]">Automated Sync Interval</p>
            <p className="text-[var(--muted)] mt-0.5">
              Scheduled background Cloudflare Worker periodically syncs problem telemetry
            </p>
          </div>

          <select
            value={autoSync}
            onChange={e => setAutoSync(e.target.value as any)}
            className="px-3 py-1.5 bg-[var(--bg)] border border-[var(--border)] rounded-md text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] font-medium"
          >
            <option value="6h">Every 6 Hours</option>
            <option value="12h">Every 12 Hours (Recommended)</option>
            <option value="24h">Every 24 Hours</option>
            <option value="manual">Manual Only</option>
          </select>
        </div>
      </div>

      {/* 5. Security & Session */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)]">
          <Shield className="w-4 h-4 text-[var(--accent)]" />
          <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--text)]">
            Security & Session
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-medium text-[var(--text)]">
              {hasSession ? 'Active Secure Session' : 'Offline Session'}
            </p>
            <p className="text-[var(--muted)] mt-0.5 font-mono text-[11px]">
              Session token stored safely in browser session storage
            </p>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--danger)]/30 text-[var(--danger)] hover:bg-[var(--danger-muted)] transition text-xs font-medium self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>

      {/* 6. Advanced Technical Details (Collapsed by default per Phase 13) */}
      <div className="p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
        <button
          onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
          className="w-full flex items-center justify-between text-left text-xs font-mono text-[var(--muted)] hover:text-[var(--text)] transition"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="font-semibold uppercase tracking-wider">
              Telemetry Audit Logs ({syncLogs.length})
            </span>
          </div>
          <span className="flex items-center gap-1 text-[11px]">
            <span>{showTechnicalDetails ? 'Hide technical details' : 'View technical details'}</span>
            {showTechnicalDetails ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showTechnicalDetails && (
          <div className="pt-2 border-t border-[var(--border-subtle)] space-y-2">
            {syncLogs.length > 0 ? (
              <div className="divide-y divide-[var(--border-subtle)] max-h-60 overflow-y-auto pr-1 font-mono text-[11px]">
                {syncLogs.slice(0, 15).map(log => (
                  <div key={log.id} className="py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[var(--text)] capitalize">{log.platform}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold ${
                          log.status === 'success' || log.status === 'completed'
                            ? 'bg-[var(--accent-muted)] text-[var(--accent)] border border-[var(--accent)]/20'
                            : 'bg-[var(--danger-muted)] text-[var(--danger)] border border-[var(--danger)]/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[var(--muted)]">
                      <span>{new Date(log.started_at).toLocaleString()}</span>
                      <span>{log.records_processed} records</span>
                    </div>
                    {log.error_message && (
                      <p className="text-[var(--danger)] text-[10px] break-all">
                        {log.error_message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[var(--muted)] font-mono py-2">
                No telemetry audit logs recorded yet.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
