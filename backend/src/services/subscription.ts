import { PrismaClient, Plan } from '@prisma/client';

const prisma = new PrismaClient();

export const canUsePro = async (userId: string): Promise<boolean> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return false;
  if (subscription.plan !== 'PRO') return false;

  // Check if subscription is active/trialing
  if (subscription.status !== 'ACTIVE' && subscription.status !== 'TRIALING') return false;

  return true;
};

export const isTrialActive = async (userId: string): Promise<boolean> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (!subscription) return false;
  if (!subscription.trialEndsAt) return false;
  if (subscription.status !== 'TRIALING') return false;

  return new Date() < new Date(subscription.trialEndsAt);
};

export const getPlan = async (userId: string): Promise<Plan | null> => {
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return subscription?.plan || null;
};

export const updatePlan = async (userId: string, plan: Plan) => {
  return prisma.subscription.update({
    where: { userId },
    data: { plan },
  });
};
