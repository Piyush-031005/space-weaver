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

// Mount routes
app.use('/api', engineRoutes);
app.use('/api', shareRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'SpaceWeaver Backend running' });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`SpaceWeaver Backend running on http://localhost:${PORT}`);
  });
}

export default app;
