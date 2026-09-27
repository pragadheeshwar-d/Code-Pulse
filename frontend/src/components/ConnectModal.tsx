import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { PlatformType } from '../types';

interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlatform?: PlatformType;
  onConnect: (platform: PlatformType, username: string) => Promise<void>;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({
  isOpen,
  onClose,
  defaultPlatform = 'leetcode',
  onConnect
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>(defaultPlatform);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setSelectedPlatform(defaultPlatform);
    setUsername('');
    setError(null);
    setSuccess(false);
  }, [defaultPlatform, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConnect(selectedPlatform, username.trim());
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err?.message || 'Failed to verify account on the platform');
    } finally {
      setLoading(false);
    }
  };

  const platforms: { id: PlatformType; name: string; placeholder: string; note: string }[] = [
    {
      id: 'leetcode',
      name: 'LeetCode',
      placeholder: 'Enter your LeetCode username',
      note: 'Connects to official LeetCode GraphQL public profile'
    },
    {
      id: 'codeforces',
      name: 'Codeforces',
      placeholder: 'Enter your Codeforces handle',
      note: 'Connects to official Codeforces REST API'
    },
    {
      id: 'codechef',
      name: 'CodeChef',
      placeholder: 'Enter your CodeChef handle',
      note: 'Fetches public CodeChef rating & problem solving history'
    },
    {
      id: 'geeksforgeeks',
      name: 'GeeksforGeeks',
      placeholder: 'Enter your GeeksforGeeks handle',
      note: 'Connects to public GeeksforGeeks profile'
    }
  ];

  const currentConfig = platforms.find(p => p.id === selectedPlatform)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#101726] border border-[#212f4d] rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#64748b] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white tracking-tight">Connect Coding Platform</h3>
        <p className="text-xs text-[#8b9cb4] mt-1">
          Enter your public handle to dynamically collect and track your real statistics.
        </p>

        {/* Platform Selection */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          {platforms.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPlatform(p.id);
                setError(null);
              }}
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                selectedPlatform === p.id
                  ? 'border-blue-500 bg-blue-600/10 text-white shadow-sm'
                  : 'border-[#1e293b] bg-[#141d2f] text-[#8b9cb4] hover:border-[#2a3854] hover:text-white'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">
              {currentConfig.name} Username / Handle
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder={currentConfig.placeholder}
              disabled={loading}
              className="w-full px-3.5 py-2.5 bg-[#141d2f] border border-[#22314e] rounded-lg text-sm text-white placeholder-[#475569] focus:outline-none focus:border-blue-500 transition-colors font-mono"
            />
            <p className="text-[11px] text-[#64748b] mt-1.5">{currentConfig.note}</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2.5 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>Account verified & connected successfully!</span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-[#8b9cb4] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !username.trim()}
              className="flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-[#64748b] text-white transition-all shadow-sm"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Verifying...' : 'Connect & Sync'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
