import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const prisma = new PrismaClient();
const router = Router();

// Get all users (admin only)
router.get('/users', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { subscription: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get user details (admin only)
router.get('/users/:userId', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.userId },
      include: { subscription: true },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Manually grant Pro access (admin only)
router.post('/users/:userId/grant-pro', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId: req.params.userId },
      data: { plan: 'PRO', status: 'ACTIVE' },
    });
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Manually revoke access (admin only)
router.post('/users/:userId/revoke-access', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const subscription = await prisma.subscription.update({
      where: { userId: req.params.userId },
      data: { plan: 'FREE', status: 'ACTIVE' },
    });
    res.json(subscription);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get/update Stripe keys (admin only)
router.get('/stripe-config', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const admin = await prisma.adminProfile.findUnique({
      where: { userId: req.userId! },
    });
    res.json({
      publishableKey: admin?.stripePublishableKey || '',
      hasSecretKey: !!admin?.stripeSecretKey,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/stripe-config', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const { publishableKey, secretKey, webhookSecret } = req.body;

    const admin = await prisma.adminProfile.findUnique({
      where: { userId: req.userId! },
    });

    if (admin) {
      await prisma.adminProfile.update({
        where: { id: admin.id },
        data: {
          stripePublishableKey: publishableKey,
          stripeSecretKey: secretKey,
          stripeWebhookSecret: webhookSecret,
        },
      });
    } else {
      await prisma.adminProfile.create({
        data: {
          userId: req.userId!,
          stripePublishableKey: publishableKey,
          stripeSecretKey: secretKey,
          stripeWebhookSecret: webhookSecret,
        },
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
