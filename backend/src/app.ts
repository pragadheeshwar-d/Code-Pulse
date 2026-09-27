import express from 'express';
import cors from 'cors';
import router from './routes/api.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Main API Router
  app.use('/api', router);

  // Fallback 404
  app.use((req, res) => {
    res.status(404).json({ success: false, error: 'Endpoint not found' });
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[ServerError]', err);
    res.status(500).json({ success: false, error: err?.message || 'Internal server error' });
  });

  return app;
}
