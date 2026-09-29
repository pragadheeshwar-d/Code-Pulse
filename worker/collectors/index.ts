import { BaseCollector } from './base';
import { LeetCodeCollector } from './leetcode';
import { CodeChefCollector } from './codechef';
import { CodeforcesCollector } from './codeforces';
import { GeeksforGeeksCollector } from './geeksforgeeks';
import { PlatformType } from '../types';

export function getCollector(platform: PlatformType): BaseCollector {
  switch (platform) {
    case 'leetcode':
      return new LeetCodeCollector();
    case 'codechef':
      return new CodeChefCollector();
    case 'codeforces':
      return new CodeforcesCollector();
    case 'geeksforgeeks':
      return new GeeksforGeeksCollector();
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

export * from './base';
export * from './leetcode';
export * from './codechef';
export * from './codeforces';
export * from './geeksforgeeks';
