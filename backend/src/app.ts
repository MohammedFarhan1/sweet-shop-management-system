import express from 'express';
import cors from 'cors';
import { authRoutes } from './modules/auth/auth.routes';
import { sweetRoutes } from './modules/sweets/sweet.routes';
import { orderRoutes } from './modules/orders/order.routes';
import { cartRoutes } from './modules/cart/cart.routes';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sweets', sweetRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Sweet Shop Management System API',
    endpoints: {
      auth: '/api/auth',
      sweets: '/api/sweets',
      health: '/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});