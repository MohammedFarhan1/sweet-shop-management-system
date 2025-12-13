import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});