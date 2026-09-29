import { PlatformType } from '../types';

/**
 * Extracts a normalized username/handle from either:
 * - A full profile URL (e.g., https://leetcode.com/u/kaviya2401/)
 * - A short or alternative URL (e.g., https://www.codechef.com/users/pragadhees_06)
 * - A raw handle with or without leading @ (e.g., @tourist or tourist)
 */
export function extractUsername(platform: PlatformType, input: string): string {
  if (!input) return '';
  let val = input.trim();
  if (!val) return '';

  // Strip query parameters and hash fragments, plus trailing slashes
  val = val.split('?')[0].split('#')[0].replace(/\/+$/, '');

  // If the input contains a slash or dot, attempt URL regex extraction
  if (val.includes('/') || val.includes('.')) {
    if (platform === 'leetcode') {
      const match = val.match(/leetcode\.(?:com|cn)\/(?:u\/)?([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    } else if (platform === 'codechef') {
      const match = val.match(/codechef\.com\/users\/([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    } else if (platform === 'codeforces') {
      const match = val.match(/codeforces\.com\/profile\/([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    } else if (platform === 'geeksforgeeks') {
      const match = val.match(/geeksforgeeks\.org\/(?:profile|user)\/([^/]+)/i);
      if (match && match[1]) return match[1].trim();
    }

    // Generic fallback for any URL format
    const segments = val.split('/').filter(Boolean);
    if (segments.length > 0) {
      const last = segments[segments.length - 1].trim();
      const reserved = ['u', 'profile', 'users', 'user', 'practice', 'leetcode', 'codechef', 'codeforces', 'geeksforgeeks', 'www'];
      if (last && !reserved.includes(last.toLowerCase())) {
        return last;
      }
    }
  }

  // Strip leading @ symbols from raw handles
  return val.replace(/^@+/, '').trim();
}

/**
 * Detects which competitive programming platform a URL belongs to.
 */
export function detectPlatformFromUrl(input: string): PlatformType | null {
  if (!input) return null;
  const lower = input.toLowerCase();
  if (lower.includes('leetcode.com') || lower.includes('leetcode.cn')) return 'leetcode';
  if (lower.includes('codechef.com')) return 'codechef';
  if (lower.includes('codeforces.com')) return 'codeforces';
  if (lower.includes('geeksforgeeks.org')) return 'geeksforgeeks';
  return null;
}

/**
 * Generates the canonical public profile URL for a given platform and username.
 */
export function getCanonicalProfileUrl(platform: PlatformType, username: string): string {
  const handle = username.trim().replace(/^@+/, '');
  switch (platform) {
    case 'leetcode':
      return `https://leetcode.com/u/${handle}/`;
    case 'codeforces':
      return `https://codeforces.com/profile/${handle}`;
    case 'codechef':
      return `https://www.codechef.com/users/${handle}`;
    case 'geeksforgeeks':
      return `https://www.geeksforgeeks.org/profile/${handle}`;
    default:
      return `https://${platform}.com/${handle}`;
  }
}

export interface PlatformConfig {
  id: PlatformType;
  name: string;
  placeholder: string;
  exampleUrl: string;
  note: string;
}

export const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'leetcode',
    name: 'LeetCode',
    placeholder: 'https://leetcode.com/u/username or username',
    exampleUrl: 'https://leetcode.com/u/your_username',
    note: 'Connects to official LeetCode GraphQL public profile'
  },
  {
    id: 'codeforces',
    name: 'Codeforces',
    placeholder: 'https://codeforces.com/profile/handle or handle',
    exampleUrl: 'https://codeforces.com/profile/your_handle',
    note: 'Connects to official Codeforces REST API'
  },
  {
    id: 'codechef',
    name: 'CodeChef',
    placeholder: 'https://www.codechef.com/users/handle or handle',
    exampleUrl: 'https://www.codechef.com/users/your_handle',
    note: 'Fetches public CodeChef rating & problem solving history'
  },
  {
    id: 'geeksforgeeks',
    name: 'GeeksforGeeks',
    placeholder: 'https://www.geeksforgeeks.org/profile/handle or handle',
    exampleUrl: 'https://www.geeksforgeeks.org/profile/your_handle',
    note: 'Connects to public GeeksforGeeks profile'
  }
];
