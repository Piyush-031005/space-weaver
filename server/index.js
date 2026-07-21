import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import layoutRoutes from './routes/layout.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount the layout generation route
app.use('/api', layoutRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', engine: 'SpaceWeaver Backend running' });
});

app.listen(PORT, () => {
  console.log(`SpaceWeaver Backend running on http://localhost:${PORT}`);
});
