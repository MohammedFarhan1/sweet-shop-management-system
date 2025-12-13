import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes';
import { sweetRoutes } from './modules/sweets/sweet.routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});