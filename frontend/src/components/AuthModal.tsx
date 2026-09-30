import React, { useState } from 'react';
import { X, Lock, Mail, User, Activity, AlertCircle } from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  allowClose?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, allowClose = true }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0e1626] border-t sm:border border-[#1e293b] rounded-t-2xl sm:rounded-2xl w-full max-w-md p-5 sm:p-6 shadow-2xl relative text-left max-h-[92vh] overflow-y-auto touch-scroll safe-bottom">
        {/* Mobile bottom sheet grab handle */}
        <div className="w-12 h-1 bg-gray-600/50 rounded-full mx-auto mb-3 sm:hidden" />

        {/* Close Button */}
        {allowClose && (
          <button
            onClick={onClose}
            aria-label="Close authentication dialog"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a2333] transition min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2.5">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            CODE<span className="text-blue-500">PULSE</span>
          </h3>
          <p className="text-[10px] sm:text-xs font-medium text-blue-400/90 tracking-widest uppercase mt-0.5">
            Track. Solve. Grow.
          </p>
          <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto">
            {isRegister
              ? 'Create your personal coding analytics account'
              : 'Sign in to access your coding analytics and synced metrics'}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 p-1 bg-[#141d30] border border-[#1e2a42] rounded-xl mb-4 sm:mb-5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setError(null); }}
            className={`py-2 rounded-lg transition min-h-[40px] ${
              !isRegister ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setError(null); }}
            className={`py-2 rounded-lg transition min-h-[40px] ${
              isRegister ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form: Mobile-first 16px font size to prevent iOS zoom */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Chen"
                  autoComplete="name"
                  className="w-full bg-[#141d30] border border-[#1e2a42] rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition min-h-[44px]"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="email"
                inputMode="email"
                className="w-full bg-[#141d30] border border-[#1e2a42] rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition min-h-[44px]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                className="w-full bg-[#141d30] border border-[#1e2a42] rounded-xl pl-9 pr-3 py-2.5 text-base sm:text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition min-h-[44px]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 mt-4 min-h-[44px] active:scale-[0.98]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isRegister ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-[11px] text-gray-500 text-center mt-4">
          Secured with Argon2/bcrypt password hashing & standard JWT sessions.
        </p>
      </div>
    </div>
  );
};
