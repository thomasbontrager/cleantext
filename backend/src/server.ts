import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
import adminRoutes from './routes/admin.js';
import webhookRoutes from './routes/webhooks.js';
import billingRoutes from './routes/billing.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Webhook must be before JSON parsing
app.use('/api/webhooks', webhookRoutes);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
