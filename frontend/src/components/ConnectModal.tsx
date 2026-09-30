import React, { useState } from 'react';
import { X, Loader2, AlertCircle, CheckCircle, Link2 } from 'lucide-react';
import { PlatformType } from '../types';
import { extractUsername, detectPlatformFromUrl, PLATFORM_CONFIGS } from '../utils/platform';

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
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  React.useEffect(() => {
    setSelectedPlatform(defaultPlatform);
    setInputValue('');
    setError(null);
    setSuccess(false);
  }, [defaultPlatform, isOpen]);

  if (!isOpen) return null;

  const currentConfig = PLATFORM_CONFIGS.find(p => p.id === selectedPlatform) || PLATFORM_CONFIGS[0];
  const detectedUsername = extractUsername(selectedPlatform, inputValue);
  const isUrlInput = inputValue.trim().includes('/') || inputValue.trim().includes('.');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setError(null);

    // Auto-switch platform if the pasted URL belongs to a different supported platform
    const detected = detectPlatformFromUrl(val);
    if (detected && detected !== selectedPlatform) {
      setSelectedPlatform(detected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = extractUsername(selectedPlatform, inputValue);
    if (!cleanUsername) {
      setError(`Please enter a valid ${currentConfig.name} profile link or username`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onConnect(selectedPlatform, cleanUsername);
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#101726] border-t sm:border border-[#212f4d] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto touch-scroll safe-bottom">
        {/* Mobile bottom sheet grab handle */}
        <div className="w-12 h-1 bg-gray-600/50 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close connect modal"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-lg text-[#64748b] hover:text-white hover:bg-[#162035] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-white tracking-tight">Connect Coding Platform</h3>
        <p className="text-xs text-[#8b9cb4] mt-1">
          Paste your public profile link or enter your username to automatically track your verified statistics.
        </p>

        {/* Platform Selection */}
        <div className="grid grid-cols-2 gap-2 mt-4 sm:mt-5">
          {PLATFORM_CONFIGS.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setSelectedPlatform(p.id);
                setError(null);
              }}
              className={`p-3 rounded-lg border text-xs font-semibold text-left transition-all min-h-[44px] active:scale-[0.98] ${
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
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#cbd5e1] mb-1.5">
              {currentConfig.name} Profile Link or Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                placeholder={currentConfig.placeholder}
                disabled={loading}
                autoCapitalize="none"
                autoCorrect="off"
                className="w-full px-3.5 py-2.5 bg-[#141d2f] border border-[#22314e] rounded-lg text-base sm:text-sm text-white placeholder-[#475569] focus:outline-none focus:border-blue-500 transition-colors font-mono min-h-[44px]"
              />
            </div>

            {/* Live Detected Handle preview */}
            {inputValue.trim() && isUrlInput && detectedUsername && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1.5 rounded-md font-mono">
                <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="text-[#8b9cb4]">Detected Handle:</span>
                <span className="text-white font-semibold">@{detectedUsername}</span>
              </div>
            )}

            <p className="text-[11px] text-[#64748b] mt-1.5">
              Paste URL (e.g. <span className="text-[#8b9cb4] font-mono">{currentConfig.exampleUrl}</span>) or your handle.
            </p>
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
              <span>
                Account {detectedUsername ? `@${detectedUsername}` : ''} verified & connected successfully!
              </span>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 text-xs font-semibold text-[#8b9cb4] hover:text-white transition-colors min-h-[44px] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800/40 disabled:text-[#64748b] text-white transition-all shadow-sm min-h-[44px] active:scale-[0.98]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>{loading ? 'Verifying...' : 'Connect & Sync'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
