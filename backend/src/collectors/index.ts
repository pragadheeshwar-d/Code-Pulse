import { BaseCollector } from './base.collector.js';
import { LeetCodeCollector } from './leetcode.collector.js';
import { CodeforcesCollector } from './codeforces.collector.js';
import { CodeChefCollector } from './codechef.collector.js';
import { GeeksforGeeksCollector } from './geeksforgeeks.collector.js';
import { PlatformType } from '../types/index.js';

const collectors: Record<PlatformType, BaseCollector> = {
  leetcode: new LeetCodeCollector(),
  codeforces: new CodeforcesCollector(),
  codechef: new CodeChefCollector(),
  geeksforgeeks: new GeeksforGeeksCollector()
};

export function getCollector(platform: PlatformType): BaseCollector {
  const collector = collectors[platform];
  if (!collector) {
    throw new Error(`Unsupported platform: ${platform}`);
  }
  return collector;
}

export {
  BaseCollector,
  LeetCodeCollector,
  CodeforcesCollector,
  CodeChefCollector,
  GeeksforGeeksCollector
};
