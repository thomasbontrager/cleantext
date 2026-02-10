import { Router, Request, Response, raw } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const router = Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' as any });

router.post('/webhook', raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return res.status(400).json({ error: 'Webhook signature verification failed' });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const user = await prisma.user.findUnique({
          where: { stripeId: customerId },
        });

        if (user) {
          const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID;
          const proPriceId = process.env.STRIPE_PRO_PRICE_ID;
          const priceId = subscription.items.data[0]?.price.id;
          if (!starterPriceId || !proPriceId) {
            throw new Error('Missing Stripe price IDs in environment');
          }
          const plan = priceId === starterPriceId ? 'STARTER' : 'PRO';
          const status = subscription.status === 'trialing' ? 'TRIALING' : 'ACTIVE';

          await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              stripeSubscriptionId: subscription.id,
              stripeCustomerId: customerId,
              plan,
              status,
              trialEndsAt: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const user = await prisma.user.findUnique({
          where: { stripeId: subscription.customer as string },
        });

        if (user) {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: {
              plan: 'FREE',
              status: 'CANCELED',
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const user = await prisma.user.findUnique({
          where: { stripeId: invoice.customer as string },
        });

        if (user) {
          await prisma.subscription.update({
            where: { userId: user.id },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    res.status(400).json({ error: 'Webhook processing failed' });
  }
});

export default router;
