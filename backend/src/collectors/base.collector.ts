import { NormalizedProfileData, PlatformType } from '../types/index.js';

export abstract class BaseCollector {
  abstract readonly platform: PlatformType;

  abstract validateUsername(username: string): Promise<boolean>;
  abstract fetchProfile(username: string): Promise<NormalizedProfileData>;

  protected async fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 12000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json, text/html, */*',
          ...(options.headers || {})
        }
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
      }
      throw err;
    }
  }
}
