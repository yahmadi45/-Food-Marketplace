import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import restaurantsPublic from './routes/restaurantsPublic.js';
import commandesRoutes from './routes/commandes.js';
import adminRoutes from './routes/admin.js';
import { query } from './db.js';

export function createApp({ databaseQuery = query } = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:8080', credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  // Liveness: confirms the API process can accept requests.
  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  // Readiness: confirms the API can also reach its database.
  app.get('/api/health/ready', async (_req, res) => {
    try {
      await databaseQuery('SELECT 1');
      res.json({ ok: true, database: 'connected' });
    } catch {
      res.status(503).json({ ok: false, database: 'unavailable' });
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/commandes', commandesRoutes);
  app.use('/api/restaurants', restaurantsPublic);
  app.use('/api/admin', adminRoutes);

  return app;
}

export default createApp();
