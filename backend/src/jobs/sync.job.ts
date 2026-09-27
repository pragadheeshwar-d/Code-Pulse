import cron from 'node-cron';
import { SyncService } from '../services/sync.service.js';
import { getDb } from '../db/database.js';

let cronTask: cron.ScheduledTask | null = null;
const syncService = new SyncService();

export function startAutoSyncJob() {
  // Check settings
  const db = getDb();
  const settings = db.prepare('SELECT auto_sync_interval FROM user_settings LIMIT 1').get() as { auto_sync_interval: string } | undefined;
  const interval = settings?.auto_sync_interval || '12h';

  if (interval === 'manual') {
    console.log('[AutoSync] Scheduled sync disabled (manual mode).');
    return;
  }

  // Schedule expression based on interval
  // 6h: every 6 hours (0 */6 * * *)
  // 12h: every 12 hours (0 */12 * * *)
  // 24h: once daily at midnight (0 0 * * *)
  let cronExpr = '0 */12 * * *';
  if (interval === '6h') cronExpr = '0 */6 * * *';
  else if (interval === '24h') cronExpr = '0 0 * * *';

  if (cronTask) {
    cronTask.stop();
  }

  cronTask = cron.schedule(cronExpr, async () => {
    console.log(`[AutoSync] Triggering scheduled background sync at ${new Date().toISOString()}`);
    try {
      const users = db.prepare('SELECT id FROM users').all() as { id: string }[];
      for (const u of users) {
        await syncService.syncAll(u.id);
      }
      console.log('[AutoSync] Scheduled background sync finished.');
    } catch (err: any) {
      console.error('[AutoSync] Error during background sync:', err.message);
    }
  });

  console.log(`[AutoSync] Auto-sync scheduled with interval: ${interval} (${cronExpr})`);
}

export function stopAutoSyncJob() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
  }
}
