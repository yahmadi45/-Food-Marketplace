import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import restaurantsPublic from './routes/restaurantsPublic.js';
import commandesRoutes from './routes/commandes.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/commandes', commandesRoutes);
app.use('/api/restaurants', restaurantsPublic);
app.use('/api/admin', adminRoutes);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API Food Marketplace → http://localhost:${port}`);
});
