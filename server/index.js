import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import engineRoutes from './routes/engine.js';
import shareRoutes from './routes/share.js';

dotenv.config();

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

app.listen(PORT, () => {
  console.log(`SpaceWeaver Backend running on http://localhost:${PORT}`);
});
