import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { authMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

/**
 * Create Stripe Customer Portal session
 * Allows users to manage their subscription, payment methods, and view invoices
 */
router.post('/create-portal-session', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stripeCustomerId = user.subscription?.stripeCustomerId || user.stripeId;

    if (!stripeCustomerId) {
      return res.status(400).json({ error: 'No Stripe customer ID found. Please create a subscription first.' });
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/account`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error('Billing portal error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
