import express from 'express';
import cors from 'cors';

export const app = express();

app.use(cors());
app.use(express.json());

// Routes will be added here
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});