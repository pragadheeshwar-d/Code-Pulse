import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { initializeDatabase } from './db/schema.js';
import { startAutoSyncJob, stopAutoSyncJob } from './jobs/sync.job.js';
import { closeDb } from './db/database.js';

const PORT = process.env.PORT || 5000;

try {
  // Initialize Database
  initializeDatabase();
  console.log('[DB] Database schema and tables initialized.');

  // Create Express App
  const app = createApp();

  // Start Server
  const server = app.listen(PORT, () => {
    console.log(`[Server] CodeTrack Backend running on http://localhost:${PORT}`);
    // Start background auto sync job
    startAutoSyncJob();
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Shutting down gracefully...');
    stopAutoSyncJob();
    server.close(() => {
      closeDb();
      console.log('[Server] Database closed and server terminated.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (err: any) {
  console.error('[FatalError] Failed to start server:', err);
  process.exit(1);
}
