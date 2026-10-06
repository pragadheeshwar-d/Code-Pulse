import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Eye, EyeOff, CheckCircle2, ShieldCheck, Zap, Activity, ArrowRight } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { UserProfile } from '../types';
import { Logo } from './Logo';
import { PlatformIcon } from './PlatformIcon';
import { AnimatedAuthBackground } from './AnimatedAuthBackground';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  allowClose = true
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Full Name is required');
        if (!email.trim()) throw new Error('Email is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const res = await api.register({
          name: name.trim(),
          email: email.trim(),
          password
        });

        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      } else {
        if (!email.trim() || !password) throw new Error('Please enter your email and password');

        const res = await api.login({
          email: email.trim(),
          password
        });

        setAuthToken(res.token);
        onSuccess(res.user);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIsRegister(false);
    setEmail('demo@codepulse.dev');
    setPassword('demo123456');
    setError(null);
  };

  return (
    <div
      className={`min-h-screen min-h-[100dvh] w-full bg-[var(--bg)] ${
        allowClose
          ? 'fixed inset-0 z-50 overflow-y-auto touch-scroll flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md'
          : 'flex items-center justify-center p-4 sm:p-6 lg:p-12 relative overflow-x-hidden'
      }`}
    >
      {/* Animated Matrix/Neural Background Canvas */}
      <AnimatedAuthBackground />

      {/* Main Container */}
      <div
        className={`w-full relative z-10 ${
          allowClose
            ? 'max-w-md bg-[var(--surface)] border-t sm:border border-[var(--border)] rounded-t-2xl sm:rounded-2xl p-5 sm:p-8 shadow-2xl my-auto safe-bottom'
            : 'max-w-6xl mx-auto'
        }`}
      >
        {/* Close Button (if modal allows close) */}
        {allowClose && (
          <button
            onClick={onClose}
            aria-label="Close authentication screen"
            className="absolute top-4 right-4 p-2 rounded-xl text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Layout: Split-screen Grid on Fullscreen Auth, Single Card on Floating Modal */}
        <div className={!allowClose ? 'grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center justify-between' : 'w-full'}>
          {/* Left Column: Hero Showcase (Visible on fullscreen Auth page) */}
          {!allowClose && (
            <div className="lg:col-span-7 space-y-6 lg:pr-6 text-left">
              <Logo size="md" showVersion={true} showSubtitle={true} />

              <div className="space-y-3 pt-2">
                <h1 className="text-3xl sm:text-4xl xl:text-5xl font-extrabold text-[var(--text)] tracking-tight leading-[1.15]">
                  Every contest. Every streak.<br />
                  <span className="text-[var(--accent)]">One dashboard.</span>
                </h1>
                <p className="text-xs sm:text-sm text-[var(--muted)] leading-relaxed max-w-lg">
                  CodePulse pulls your solved problems, contest ratings, and daily streaks from LeetCode, Codeforces, CodeChef, and GeeksforGeeks into one dashboard.
                </p>
              </div>

              {/* Feature Highlights List */}
              <div className="space-y-4 pt-4 border-t border-[var(--border)] max-w-lg">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--accent)] mt-0.5 shadow-sm">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider font-mono">MULTI-PLATFORM SYNC</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Add your handles once and see every platform side by side.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--accent)] mt-0.5 shadow-sm">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider font-mono">52-WEEK ACTIVITY HEATMAP</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Spot your solving patterns and keep your daily streak alive.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shrink-0 text-[var(--accent)] mt-0.5 shadow-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider font-mono">GOALS & MILESTONES</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Set targets like 500 solved or a 1800 rating and track real progress.</p>
                  </div>
                </div>
              </div>

              {/* Platform Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-2.5">
                <span className="text-[11px] font-mono font-medium text-[var(--accent)] uppercase mr-1">SUPPORTED:</span>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text)] shadow-xs">
                  <PlatformIcon platform="leetcode" className="w-4 h-4" />
                  <span className="text-xs font-semibold">LeetCode</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text)] shadow-xs">
                  <PlatformIcon platform="codeforces" className="w-4 h-4" />
                  <span className="text-xs font-semibold">Codeforces</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text)] shadow-xs">
                  <PlatformIcon platform="codechef" className="w-4 h-4" />
                  <span className="text-xs font-semibold">CodeChef</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text)] shadow-xs">
                  <PlatformIcon platform="geeksforgeeks" className="w-4 h-4" />
                  <span className="text-xs font-semibold">GFG</span>
                </div>
              </div>
            </div>
          )}

          {/* Right Column / Form Container */}
          <div className={!allowClose ? 'lg:col-span-5 w-full max-w-[440px] mx-auto' : 'w-full'}>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 sm:p-8 shadow-2xl relative">
              {/* Header inside Form Card (Shown on mobile or dialog) */}
              <div className="text-center mb-6">
                {allowClose && <Logo size="md" showVersion={false} showSubtitle={false} className="justify-center mb-2" />}
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text)] tracking-tight font-sans">
                  {isRegister ? 'Create account' : 'Welcome back'}
                </h2>
                <p className="text-xs text-[var(--muted)] mt-1">
                  {isRegister
                    ? 'Create an account to see your dashboard.'
                    : 'Sign in to see your dashboard.'}
                </p>
              </div>

              {/* Tab Switcher */}
              <div className="grid grid-cols-2 p-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => { setIsRegister(false); setError(null); }}
                  className={`py-2.5 rounded-lg transition-all min-h-[40px] flex items-center justify-center ${
                    !isRegister
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-md'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setIsRegister(true); setError(null); }}
                  className={`py-2.5 rounded-lg transition-all min-h-[40px] flex items-center justify-center ${
                    isRegister
                      ? 'bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-md'
                      : 'text-[var(--muted)] hover:text-[var(--text)]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 p-3.5 mb-5 rounded-xl bg-[var(--danger)]/10 border border-[var(--danger)]/25 text-[var(--danger)] text-xs animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegister && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Alex Chen"
                        autoComplete="name"
                        className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-10 pr-3.5 py-3 text-base sm:text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all min-h-[46px]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[var(--text)] mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      autoComplete="email"
                      inputMode="email"
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-10 pr-3.5 py-3 text-base sm:text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all min-h-[46px]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[var(--text)]">
                      Password
                    </label>
                    {isRegister && (
                      <span className="text-[10px] text-[var(--muted)] font-mono">
                        Min. 6 characters
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      autoComplete={isRegister ? 'new-password' : 'current-password'}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-10 pr-10 py-3 text-base sm:text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all min-h-[46px]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[var(--muted)] hover:text-[var(--text)] transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[var(--primary)] hover:opacity-90 disabled:opacity-50 text-[var(--on-primary)] rounded-xl text-sm font-bold shadow-lg transition-all flex items-center justify-center gap-2 mt-5 min-h-[46px] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="inline-block w-4 h-4 border-2 border-[var(--on-primary)]/30 border-t-[var(--on-primary)] rounded-full animate-spin" />
                  ) : isRegister ? (
                    <>
                      <span>Create account</span>
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  ) : (
                    <>
                      <span>Sign in</span>
                      <ArrowRight className="w-[18px] h-[18px]" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Credentials Auto-Fill */}
              {!isRegister && (
                <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between text-xs">
                  <span className="text-[11px] text-[var(--muted)]">Testing out CodePulse?</span>
                  <button
                    type="button"
                    onClick={handleFillDemo}
                    className="text-[11px] font-semibold text-[var(--accent)] hover:underline transition-colors"
                  >
                    Quick Fill Demo Credentials
                  </button>
                </div>
              )}

              {/* Footer Security Badge */}
              <div className="mt-5 text-center flex items-center justify-center gap-1.5 text-[11px] text-[var(--muted)] font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span>Your password is hashed and never stored in plain text.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
