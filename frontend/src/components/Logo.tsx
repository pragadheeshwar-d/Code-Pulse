import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showVersion?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showVersion = true,
  showSubtitle = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Brand SVG Badge */}
      <div
        className={`${iconDimensions[size]} rounded-lg bg-[var(--surface)] border border-[var(--border)] shadow-sm flex items-center justify-center shrink-0 group relative overflow-hidden`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[var(--accent)]/10 to-transparent opacity-50" />
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5 relative z-10"
        >
          {/* Outer code bracket accents */}
          <path
            d="M7 13L4 16L7 19"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M25 13L28 16L25 19"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Central Pulse Wave */}
          <path
            d="M9 16H12L14.5 10L17.5 22L20.5 13L22.5 16H23.5"
            stroke="var(--accent)"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="flex flex-col justify-center min-w-0">
        <div className="flex items-center gap-1.5">
          <span className={`font-extrabold tracking-tight text-[var(--text)] font-sans ${textSizes[size]}`}>
            CODE<span className="text-[var(--accent)] drop-shadow-[0_0_8px_rgba(52,211,153,0.35)]">PULSE</span>
          </span>
          {showVersion && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/25 rounded font-bold tracking-widest shrink-0">
              v1.0
            </span>
          )}
        </div>

        {showSubtitle && (
          <span className="text-[10px] tracking-wider uppercase text-[var(--accent)] font-semibold block mt-0.5 font-mono">
            ALL YOUR CODING STATS, ONE PLACE
          </span>
        )}
      </div>
    </div>
  );
};
