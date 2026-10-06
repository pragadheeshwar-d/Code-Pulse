import React from 'react';
import { PlatformType } from '../types';

interface PlatformIconProps {
  platform: PlatformType;
  className?: string;
}

export const PlatformIcon: React.FC<PlatformIconProps> = ({ platform, className = 'w-5 h-5' }) => {
  switch (platform) {
    case 'leetcode':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current text-[var(--warm)]`}>
          <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.136-.011-.001-.023-.001-.035-.001-.001 0-.002 0-.003 0z" />
        </svg>
      );

    case 'codechef':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current text-[var(--warm)]`}>
          {/* Authentic CodeChef Chef Toque/Hat Vector Emblem */}
          <path d="M19.5 10.5C19.5 8 17.5 6 15 6C14.4 6 13.8 6.1 13.3 6.4C12.7 4.4 10.9 3 8.7 3C6.1 3 4 5.1 4 7.7C4 8.2 4.1 8.7 4.3 9.1C2.9 9.8 2 11.3 2 13C2 15.2 3.8 17 6 17H18C20.2 17 22 15.2 22 13C22 11.6 21.1 10.4 19.5 10.5Z" />
          <path d="M6 18.2h12v1.6a.4.4 0 01-.4.4H6.4a.4.4 0 01-.4-.4v-1.6z" opacity="0.85" />
          <path d="M7.5 21h9v1H7.5z" opacity="0.6" />
        </svg>
      );

    case 'geeksforgeeks':
      return (
        <svg viewBox="0 0 24 24" className={`${className} fill-current text-[var(--accent)]`}>
          {/* Official GeeksforGeeks GFG Bracket Emblem */}
          <path d="M8.5 4H5.5A1.5 1.5 0 004 5.5V9c0 .85-.45 1.6-1.15 2.05a.5.5 0 000 .9C3.55 12.4 4 13.15 4 14v3.5A1.5 1.5 0 005.5 19h3a.5.5 0 000-1H6v-3.5C6 13.12 5.38 12.3 4.5 12 5.38 11.7 6 10.88 6 9.5V5h2.5a.5.5 0 000-1z" />
          <path d="M15.5 4h3a1.5 1.5 0 011.5 1.5V9c0 .88.62 1.7 1.5 2-.88.3-1.5 1.12-1.5 2.5v3.5a1.5 1.5 0 01-1.5 1.5h-3a.5.5 0 010-1H18v-3.5c0-.85.45-1.6 1.15-2.05a.5.5 0 000-.9C18.45 11.6 18 10.85 18 10V5h-2.5a.5.5 0 010-1z" />
          <path d="M9.5 10.5a1.5 1.5 0 011.5-1.5h2a.5.5 0 010 1h-2a.5.5 0 00-.5.5v3a.5.5 0 00.5.5h1.5v-1H12a.5.5 0 010-1h1.5a.5.5 0 01.5.5v2.5a.5.5 0 01-.5.5h-2.5a1.5 1.5 0 01-1.5-1.5v-3z" />
        </svg>
      );

    case 'codeforces':
      return (
        <div className="flex items-end gap-0.5 h-4 w-4 justify-center">
          <span className="w-1 h-2 bg-[var(--warm)] opacity-70 rounded-xs" />
          <span className="w-1 h-4 bg-[var(--warm)] rounded-xs" />
          <span className="w-1 h-2.5 bg-[var(--warm)] opacity-85 rounded-xs" />
        </div>
      );

    default:
      return null;
  }
};
