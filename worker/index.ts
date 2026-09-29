import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { AppEnv } from './types';
import { initializeDatabase } from './db/schema';
import authRoutes from './routes/auth';
import apiRoutes from './routes/api';
import domainRoutes from './routes/domain';
import { SyncService } from './services/sync';

const app = new Hono<AppEnv>();

app.use('/api/*', cors());

app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.route('/api/auth', authRoutes);
app.route('/api', domainRoutes);
app.route('/api', apiRoutes);

app.all('*', (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

export default {
  fetch: app.fetch,
  
  async scheduled(event: ScheduledEvent, env: AppEnv['Bindings'], ctx: ExecutionContext) {
    const db = env.DB;
    const syncService = new SyncService(db);
    
    try {
      const { results: users } = await db.prepare('SELECT id FROM users').all<{ id: string }>();
      
      for (const user of users) {
        try {
          await syncService.syncAll(user.id);
        } catch (e) {
          console.error(`[AutoSync] Failed for user ${user.id}:`, e);
        }
      }
    } catch (e) {
      console.error('[AutoSync] Failed to fetch users:', e);
    }
  }
};
