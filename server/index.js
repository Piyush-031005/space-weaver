import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import engineRoutes from './routes/engine.js';
import shareRoutes from './routes/share.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes mounted at /api — Vercel rewrite sends /api/* to this Express app
// Express sees the full URL path including /api prefix
app.use('/api', engineRoutes);
app.use('/api', shareRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'SpaceWeaver Backend running' });
});

// Catch-all: log unmatched routes to help debug Vercel routing
app.use((req, res) => {
  console.error(`[404] Unmatched route: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found', method: req.method, url: req.url });
});

// On Vercel, static files are handled automatically. Only serve them if running locally.
if (!process.env.VERCEL) {
  app.use(express.static(path.join(process.cwd(), 'dist')));
  app.use((req, res) => {
    res.sendFile(path.join(process.cwd(), 'dist/index.html'));
  });
}

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SpaceWeaver Backend running on http://localhost:${PORT}`);
  });
}

export default app;
