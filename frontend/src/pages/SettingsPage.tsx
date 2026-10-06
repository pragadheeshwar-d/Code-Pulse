import React, { useState, useEffect } from 'react';
import { Save, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { UserProfile, UserSettings, SyncLog, PlatformCardData, PlatformType } from '../types';

interface SettingsPageProps {
  user: UserProfile | null;
  settings: UserSettings | null;
  platforms: PlatformCardData[];
  syncLogs: SyncLog[];
  onUpdateProfile: (data: Partial<UserProfile & UserSettings>) => Promise<void>;
  onDisconnectPlatform: (platform: PlatformType) => Promise<void>;
  onConnectPlatform?: (platform: PlatformType) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  settings,
  platforms,
  syncLogs,
  onUpdateProfile,
  onDisconnectPlatform,
  onConnectPlatform
}) => {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [autoSync, setAutoSync] = useState(settings?.auto_sync_interval || '12h');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="pb-4 border-b border-[var(--border)]">
        <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">Settings & Telemetry Preferences</h2>
        <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
          Configure profile metadata, automated background sync intervals, and telemetry audit logs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left Form: Profile & Sync settings */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-5">
          <form onSubmit={handleSave} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
            <h3 className="font-semibold text-[var(--text)] text-sm font-sans tracking-tight">Personal Profile</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5 font-mono">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  autoComplete="name"
                  className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[38px]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5 font-mono">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  className="w-full px-3.5 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[38px]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--border)]">
              <h3 className="font-semibold text-[var(--text)] text-sm mb-1 font-sans tracking-tight">Automated Telemetry Sync</h3>
              <p className="text-xs text-[var(--muted)] mb-3">
                Background Cloudflare Worker periodically syncs telemetry and generates mathematical snapshots.
              </p>

              <select
                value={autoSync}
                onChange={e => setAutoSync(e.target.value as any)}
                className="w-full sm:w-64 px-3 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs text-[var(--text)] focus:outline-none focus:border-[var(--accent)] min-h-[38px] font-medium"
              >
                <option value="6h">Every 6 Hours</option>
                <option value="12h">Every 12 Hours (Recommended)</option>
                <option value="24h">Once Daily (Every 24 Hours)</option>
                <option value="manual">Manual Only (No background sync)</option>
              </select>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-lg flex items-center gap-2 text-xs text-[var(--accent)] font-mono">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Profile settings saved successfully!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold bg-[var(--primary)] hover:opacity-90 text-[var(--on-primary)] transition-all shadow-sm min-h-[38px] active:scale-[0.98]"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>

          {/* Connected Platform Accounts */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
            <h3 className="font-semibold text-[var(--text)] text-sm mb-4 font-sans tracking-tight">Connected Accounts</h3>
            <div className="divide-y divide-[var(--border)]">
              {platforms.map(p => (
                <div key={p.platform} className="py-3 flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-[var(--text)] capitalize">{p.platform}</span>
                    {p.connected ? (
                      <span className="text-[var(--muted)] font-mono">@{p.username}</span>
                    ) : (
                      <span className="text-[var(--muted)]/60">Not linked</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 self-end min-[360px]:self-auto">
                    {p.connected && p.profile_url && (
                      <a
                        href={p.profile_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[var(--accent)] hover:underline flex items-center gap-1 transition-colors p-1"
                        title="View public profile"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </a>
                    )}
                    {p.connected ? (
                      <button
                        onClick={() => onDisconnectPlatform(p.platform)}
                        className="text-xs text-[var(--danger)] hover:underline transition-colors px-2 py-1 rounded hover:bg-[var(--danger)]/10 font-medium"
                      >
                        Disconnect
                      </button>
                    ) : onConnectPlatform ? (
                      <button
                        onClick={() => onConnectPlatform(p.platform)}
                        className="text-xs text-[var(--accent)] hover:underline transition-colors px-2 py-1 rounded hover:bg-[var(--accent)]/10 font-medium"
                      >
                        Connect
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sync Logs */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
            </div>
            <h3 className="font-semibold text-[var(--text)] text-sm font-sans tracking-tight">Telemetry Audit Logs</h3>
          </div>

          {syncLogs.length > 0 ? (
            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 touch-scroll">
              {syncLogs.slice(0, 15).map(log => (
                <div
                  key={log.id}
                  className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--text)] capitalize">{log.platform}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                        log.status === 'success'
                          ? 'bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20'
                          : log.status === 'failed'
                          ? 'bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/20'
                          : 'bg-[var(--warm)]/10 text-[var(--warm)] border border-[var(--warm)]/20'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[var(--muted)] flex justify-between font-mono">
                    <span>{new Date(log.started_at).toLocaleTimeString()}</span>
                    <span>{log.records_processed} records</span>
                  </div>
                  {log.error_message && (
                    <p className="text-[11px] text-[var(--danger)] mt-1 truncate font-mono" title={log.error_message}>
                      {log.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--muted)] font-mono">No telemetry audit logs recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

