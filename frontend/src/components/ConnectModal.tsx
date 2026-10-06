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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] border-t sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto touch-scroll safe-bottom">
        {/* Mobile bottom sheet grab handle */}
        <div className="w-12 h-1 bg-[var(--border)] rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close connect modal"
          className="absolute top-3 right-3 sm:top-5 sm:right-5 p-2 rounded-lg text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--bg)] transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-[var(--text)] tracking-tight">Connect Coding Platform</h3>
        <p className="text-xs text-[var(--muted)] mt-1">
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
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)] shadow-sm'
                  : 'border-[var(--border)] bg-[var(--bg)] text-[var(--muted)] hover:border-[var(--border)] hover:text-[var(--text)]'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 sm:mt-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text)] mb-1.5">
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
                className="w-full px-3.5 py-2.5 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-base sm:text-sm text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] transition-colors font-mono min-h-[44px]"
              />
            </div>

            {/* Live Detected Handle preview */}
            {inputValue.trim() && isUrlInput && detectedUsername && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-[var(--accent)] bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-2.5 py-1.5 rounded-md font-mono">
                <Link2 className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="text-[var(--muted)]">Detected Handle:</span>
                <span className="text-[var(--text)] font-semibold">@{detectedUsername}</span>
              </div>
            )}

            <p className="text-[11px] text-[var(--muted)] mt-1.5">
              Paste URL (e.g. <span className="text-[var(--text)] font-mono">{currentConfig.exampleUrl}</span>) or your handle.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg flex items-start gap-2.5 text-xs text-[var(--danger)]">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="p-3 bg-[var(--accent)]/10 border border-[var(--accent)]/30 rounded-lg flex items-center gap-2 text-xs text-[var(--accent)]">
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
              className="px-4 py-2.5 text-xs font-semibold text-[var(--muted)] hover:text-[var(--text)] transition-colors min-h-[44px] rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-[var(--primary)] hover:opacity-90 disabled:opacity-40 text-[var(--on-primary)] transition-all shadow-sm min-h-[44px] active:scale-[0.98]"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin text-[var(--on-primary)]" />}
              <span>{loading ? 'Verifying...' : 'Connect & Sync'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
