import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Clock, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile, UserSettings, SyncLog, PlatformCardData, PlatformType } from '../types';

interface SettingsPageProps {
  user: UserProfile | null;
  settings: UserSettings | null;
  platforms: PlatformCardData[];
  syncLogs: SyncLog[];
  onUpdateProfile: (data: Partial<UserProfile & UserSettings>) => Promise<void>;
  onDisconnectPlatform: (platform: PlatformType) => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  settings,
  platforms,
  syncLogs,
  onUpdateProfile,
  onDisconnectPlatform
}) => {
  const [name, setName] = useState(user?.name || '');
  const [headline, setHeadline] = useState(user?.headline || '');
  const [email, setEmail] = useState(user?.email || '');
  const [autoSync, setAutoSync] = useState(settings?.auto_sync_interval || '12h');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setHeadline(user.headline || '');
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
        headline,
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
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#1a2333]/80">
        <h2 className="text-xl font-bold text-white tracking-tight">Settings & Preferences</h2>
        <p className="text-xs text-[#8b9cb4] mt-0.5">
          Configure profile details, automated synchronization intervals, and data preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Profile & Sync settings */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="bg-[#101726] border border-[#1d263b] rounded-xl p-6 space-y-5">
            <h3 className="font-semibold text-white text-sm">Personal Profile</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141d2f] border border-[#22314e] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Headline / Tagline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={e => setHeadline(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141d2f] border border-[#22314e] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-[#141d2f] border border-[#22314e] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-3 border-t border-[#1c263c]">
              <h3 className="font-semibold text-white text-sm mb-1">Automated Synchronization Schedule</h3>
              <p className="text-xs text-[#8b9cb4] mb-3">
                Background worker periodically pulls fresh statistics and generates historical progress snapshots.
              </p>

              <select
                value={autoSync}
                onChange={e => setAutoSync(e.target.value as any)}
                className="w-full sm:w-64 px-3 py-2 bg-[#141d2f] border border-[#22314e] rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="6h">Every 6 Hours</option>
                <option value="12h">Every 12 Hours (Default)</option>
                <option value="24h">Once Daily (Every 24 Hours)</option>
                <option value="manual">Manual Only (No background sync)</option>
              </select>
            </div>

            {savedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>Settings saved successfully!</span>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </form>

          {/* Connected Platform Accounts */}
          <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-6">
            <h3 className="font-semibold text-white text-sm mb-4">Platform Accounts</h3>
            <div className="divide-y divide-[#172238]">
              {platforms.map(p => (
                <div key={p.platform} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-white capitalize">{p.platform}</span>
                    {p.connected ? (
                      <span className="text-[#8b9cb4] font-mono">@{p.username}</span>
                    ) : (
                      <span className="text-[#64748b]">Not connected</span>
                    )}
                  </div>

                  <div>
                    {p.connected && (
                      <button
                        onClick={() => onDisconnectPlatform(p.platform)}
                        className="text-xs text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sync Logs */}
        <div className="bg-[#101726] border border-[#1d263b] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-white text-sm">Recent Sync Logs</h3>
          </div>

          {syncLogs.length > 0 ? (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {syncLogs.slice(0, 15).map(log => (
                <div
                  key={log.id}
                  className="p-2.5 bg-[#141d2f] border border-[#1e2a42] rounded-lg text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white capitalize">{log.platform}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        log.status === 'success'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : log.status === 'failed'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748b] flex justify-between font-mono">
                    <span>{new Date(log.started_at).toLocaleTimeString()}</span>
                    <span>{log.records_processed} items</span>
                  </div>
                  {log.error_message && (
                    <p className="text-[11px] text-rose-400 mt-1 truncate" title={log.error_message}>
                      {log.error_message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#64748b]">No sync activity recorded yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};
