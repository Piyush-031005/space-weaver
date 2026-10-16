import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import engineRoutes from './routes/engine.js';
import shareRoutes from './routes/share.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// API 404 catch-all: log unmatched /api routes
app.all('/api/*', (req, res) => {
  console.error(`[404] Unmatched API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'API route not found', method: req.method, url: req.originalUrl });
});

// Serve frontend production build when running locally or in container
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Catch-all: send index.html for client-side routing (/blueprint-3d, /renovations, /results, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SpaceWeaver Backend running on http://localhost:${PORT}`);
  });
}

export default app;
