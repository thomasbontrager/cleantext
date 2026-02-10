import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth.js';
import { createCheckoutSession, getOrCreateCustomer, cancelSubscription, STRIPE_PRICES } from '../services/stripe.js';

const prisma = new PrismaClient();
const router = Router();

router.get('/plan', authMiddleware, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
    });
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/create-checkout-session', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { plan } = req.body;
    if (!['STARTER', 'PRO'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { subscription: true },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const customer = await getOrCreateCustomer(user.email);

    const priceId = plan === 'STARTER' ? STRIPE_PRICES.STARTER : STRIPE_PRICES.PRO;
    const session = await createCheckoutSession(customer.id, priceId, user.email);

    // Store Stripe customer ID
    if (!user.stripeId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeId: customer.id },
      });
    }

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/cancel-subscription', authMiddleware, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.userId! },
    });

    if (!subscription?.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription' });
    }

    await cancelSubscription(subscription.stripeSubscriptionId);

    await prisma.subscription.update({
      where: { userId: req.userId! },
      data: { status: 'CANCELED' },
    });

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
